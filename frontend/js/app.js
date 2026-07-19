// frontend/js/app.js
document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('pdf-file');
  const statusDisplay = document.getElementById('upload-status');

  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!fileInput.files || fileInput.files.length === 0) {
        return alert('Please select a PDF file first.');
      }

      const file = fileInput.files[0];
      if (statusDisplay) statusDisplay.textContent = 'Uploading file securely to server... Please wait.';
      
      const formData = new FormData();
      formData.append('pdf', file);

      try {
        // Sends request directly through centralized clean pipeline to /api/pdf/upload
        const result = await window.apiService.uploadPDF(formData);
        console.log('Upload workflow successful:', result);
        
        if (statusDisplay) {
          statusDisplay.style.color = 'green';
          statusDisplay.textContent = 'Upload Successful! Document uploaded cleanly.';
        }
      } catch (error) {
        console.error('Error encountered inside application layer:', error);
        if (statusDisplay) {
          statusDisplay.style.color = 'red';
          statusDisplay.textContent = `Upload Process Failed: ${error.message}`;
        }
      }
    });
  }
});  loadSummaryView();
}

function populateDocumentDropdowns() {
  const dropdownIds = ["summary-doc-select", "chat-doc-select", "quiz-doc-select", "flashcard-doc-select"];
  dropdownIds.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = "";
    appState.pdfs.forEach(pdf => {
      const option = document.createElement("option");
      option.value = pdf.id;
      option.text = pdf.filename;
      if (pdf.id === appState.selectedPdfId) option.selected = true;
      select.appendChild(option);
    });
  });
}

// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle("light-theme");
}

// --- View Specific Handlers ---

// 1. Summary View
async function loadSummaryView() {
  const pdfId = document.getElementById("summary-doc-select").value;
  if (!pdfId) return;
  appState.selectedPdfId = pdfId;

  document.getElementById("short-summary-box").innerHTML = "Summarizing with AI models...";
  document.getElementById("detailed-summary-box").innerHTML = "...";

  try {
    const data = await apiCall(`/ai/summary/${pdfId}`);
    document.getElementById("short-summary-box").innerText = data.short_summary;
    document.getElementById("detailed-summary-box").innerText = data.detailed_summary;
    
    const defs = document.getElementById("definitions-list");
    defs.innerHTML = "";
    data.definitions.forEach(d => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${d.split(":")[0] || d}</strong>: ${d.split(":")[1] || ""}`;
      defs.appendChild(li);
    });

    const formulas = document.getElementById("formulas-list");
    formulas.innerHTML = "";
    data.formulas.forEach(f => {
      const li = document.createElement("li");
      li.innerText = f;
      formulas.appendChild(li);
    });

  } catch (err) {
    document.getElementById("short-summary-box").innerText = "Summary processing failed.";
  }
}

// 2. Chat View
async function sendChatMessage() {
  const pdfId = document.getElementById("chat-doc-select").value;
  const inputEl = document.getElementById("chat-input-text");
  const text = inputEl.value.trim();
  if (!pdfId || !text) return;

  const messagesBox = document.getElementById("chat-messages");
  messagesBox.innerHTML += `<div class="msg user">${text}</div>`;
  inputEl.value = "";

  try {
    const data = await apiCall("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ pdf_id: pdfId, message: text })
    });
    messagesBox.innerHTML += `<div class="msg assistant">${data.reply}</div>`;
    messagesBox.scrollTop = messagesBox.scrollHeight;
  } catch (err) {
    messagesBox.innerHTML += `<div class="msg system">Error sending message context.</div>`;
  }
}

// 3. Quiz Engine
async function loadQuiz() {
  const pdfId = document.getElementById("quiz-doc-select").value;
  if (!pdfId) return;

  const container = document.getElementById("quiz-container");
  container.innerHTML = "Generating AI evaluation quiz...";

  try {
    const response = await apiCall(`/ai/quiz/${pdfId}`);
    container.innerHTML = "";
    response.questions.forEach((q, qIndex) => {
      const qDiv = document.createElement("div");
      qDiv.className = "quiz-question";
      qDiv.innerHTML = `<h4 style="margin: 10px 0;">Q${qIndex + 1}: ${q.question}</h4>`;
      
      q.options.forEach(opt => {
        const optionBtn = document.createElement("button");
        optionBtn.className = "btn-secondary";
        optionBtn.style.display = "block";
        optionBtn.style.margin = "5px 0";
        optionBtn.style.width = "100%";
        optionBtn.style.textAlign = "left";
        optionBtn.innerText = opt;
        
        optionBtn.onclick = () => {
          if (opt === q.correct_answer) {
            optionBtn.style.background = "#10B981"; // Success highlight
          } else {
            optionBtn.style.background = "#EF4444"; // Fail highlight
          }
          alert(`Explanation: ${q.explanation}`);
        };
        qDiv.appendChild(optionBtn);
      });
      container.appendChild(qDiv);
    });
  } catch (err) {
    container.innerHTML = "Could not synthesize quiz options.";
  }
}

// 4. Flashcard System
async function loadFlashcards() {
  const pdfId = document.getElementById("flashcard-doc-select").value;
  if (!pdfId) return;

  try {
    const data = await apiCall(`/ai/flashcards/${pdfId}`);
    appState.flashcards = data.flashcards;
    appState.currentFlashcardIndex = 0;
    updateFlashcardUI();
  } catch (err) {
    console.error(err);
  }
}

function updateFlashcardUI() {
  if (appState.flashcards.length === 0) return;
  const current = appState.flashcards[appState.currentFlashcardIndex];
  document.getElementById("flashcard-question").innerText = current.question;
  document.getElementById("flashcard-answer").innerText = current.answer;
  document.getElementById("flashcard-index").innerText = `${appState.currentFlashcardIndex + 1} / ${appState.flashcards.length}`;
  document.getElementById("card-inner").classList.remove("flipped");
}

function flipFlashcard() {
  document.getElementById("card-inner").classList.toggle("flipped");
}

function prevFlashcard() {
  if (appState.currentFlashcardIndex > 0) {
    appState.currentFlashcardIndex--;
    updateFlashcardUI();
  }
}

function nextFlashcard() {
  if (appState.currentFlashcardIndex < appState.flashcards.length - 1) {
    appState.currentFlashcardIndex++;
    updateFlashcardUI();
  }
}

// 5. Planner Logic
async function generateStudyPlan() {
  const exam_date = document.getElementById("plan-exam-date").value;
  const subjects = document.getElementById("plan-subjects").value;
  const hours = document.getElementById("plan-hours").value;

  if (!exam_date || !subjects) {
    alert("Please completely supply deadline metrics.");
    return;
  }

  const output = document.getElementById("planner-output");
  output.innerHTML = "Synthesizing dynamic calendar blueprint...";

  try {
    const response = await apiCall("/ai/planner", {
      method: "POST",
      body: JSON.stringify({ exam_date, subjects, hours })
    });

    output.innerHTML = "";
    response.timeline.forEach(phase => {
      const pDiv = document.createElement("div");
      pDiv.style.marginBottom = "20px";
      pDiv.innerHTML = `
        <h4 style="color: var(--accent-primary);">${phase.phase}</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin: 4px 0;">Focus: ${phase.focus}</p>
        <ul style="padding-left: 20px; font-size: 13px;">
          ${phase.tasks.map(t => `<li>${t}</li>`).join('')}
        </ul>
      `;
      output.appendChild(pDiv);
    });
  } catch (err) {
    output.innerText = "Could not blueprint milestones schedule.";
  }
}
