import json
from openai import OpenAI
from config import Config

ai_client = OpenAI(
    api_key=Config.OPENAI_API_KEY,
    base_url=Config.OPENAI_BASE_URL
)

def generate_summary(text):
    prompt = f"""
    Analyze the following text and generate a structured JSON response with:
    1. "short_summary": A 2-sentence quick summary.
    2. "detailed_summary": An in-depth multi-paragraph summary.
    3. "key_points": A list of the most important takeaways.
    4. "formulas": A list of mathematical or scientific formulas mentioned (if none, leave empty).
    5. "definitions": A list of key terminology and definitions.

    Return ONLY raw valid JSON matching this schema. Do not include markdown blocks or extra text.

    Text:
    {text[:6000]}
    """
    response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def answer_chat_from_pdf(text, query, history):
    system_prompt = f"""
    You are an AI Study Assistant. Answer the user's question STRICTLY based on the provided notes text.
    If the answer cannot be found in the provided notes, you MUST respond exactly with: 
    "I couldn't find that information in your uploaded notes."

    Context/Notes:
    \"\"\"{text[:8000]}\"\"\"
    """
    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-5:]:  # Send last 5 message pairs for short memory
        messages.append({"role": "user", "content": h["user"]})
        messages.append({"role": "assistant", "content": h["ai"]})
    
    messages.append({"role": "user", "content": query})

    response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3
    )
    return response.choices[0].message.content

def generate_quiz_json(text):
    prompt = f"""
    Based on the following text, generate 10 Multiple Choice Questions (MCQs).
    Return ONLY a raw JSON object containing an array under the key "questions".
    Each question object must match this schema:
    {{
        "question": "Question text here?",
        "options": ["A) option 1", "B) option 2", "C) option 3", "D) option 4"],
        "correct_answer": "A) option 1",
        "explanation": "Why this option is correct."
    }}

    Text:
    {text[:6000]}
    """
    response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def generate_flashcards_json(text):
    prompt = f"""
    Based on the following text, generate 10 educational flashcards.
    Return ONLY a raw JSON object containing an array under the key "flashcards".
    Each flashcard must match this schema:
    {{
        "question": "Question or prompt here?",
        "answer": "Concise answer here."
    }}

    Text:
    {text[:6000]}
    """
    response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

def generate_study_plan_json(exam_date, subjects, hours):
    prompt = f"""
    Create a highly structured, custom study plan.
    Exam Date: {exam_date}
    Subjects to cover: {subjects}
    Daily available study time: {hours} hours

    Return ONLY a raw JSON object matching this schema:
    {{
        "timeline": [
            {{
                "phase": "Phase Name (e.g., Week 1: Foundation)",
                "focus": "Main objective of this phase",
                "tasks": ["Task 1", "Task 2", "Task 3"]
            }}
        ],
        "tips": ["Tip 1", "Tip 2"]
    }}
    """
    response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
