let currentAuthTab = "login";

function switchAuthTab(tab) {
  currentAuthTab = tab;
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
  document.getElementById("name-group").style.display = tab === "register" ? "flex" : "none";
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("auth-name").value;
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;

  const endpoint = currentAuthTab === "register" ? "/auth/register" : "/auth/login";
  const payload = currentAuthTab === "register" ? { name, email, password } : { email, password };

  try {
    const data = await apiCall(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user_name", data.name);
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_streak", data.streak || 1);
    localStorage.setItem("user_avatar", data.profile_photo || "");
    
    initApp();
  } catch (err) {
    alert(err.message);
  }
}

function initApp() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    document.getElementById("auth-container").style.display = "flex";
    document.getElementById("app-container").style.display = "none";
  } else {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("app-container").style.display = "grid";
    
    // Set Profile Layout Info
    document.getElementById("user-name").innerText = localStorage.getItem("user_name");
    document.getElementById("hero-username").innerText = localStorage.getItem("user_name");
    document.getElementById("user-streak").innerText = `🔥 ${localStorage.getItem("user_streak") || 1} Days`;
    document.getElementById("user-avatar").src = localStorage.getItem("user_avatar") || `https://api.dicebear.com/7.x/bottts/svg?seed=Aura`;
    
    loadDashboard();
  }
}

function logout() {
  localStorage.clear();
  initApp();
}

window.addEventListener("DOMContentLoaded", initApp);
