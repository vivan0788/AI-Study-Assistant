from flask import Blueprint, request, jsonify
from routes.auth import token_required
from utils.db import pdfs_col, chats_col, quizzes_col, flashcards_col, planners_col
from utils.ai_helper import (
    generate_summary, answer_chat_from_pdf, generate_quiz_json, 
    generate_flashcards_json, generate_study_plan_json
)
from bson import ObjectId
import datetime

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/summary/<pdf_id>", methods=["GET"])
@token_required
def get_summary(pdf_id):
    pdf = pdfs_col.find_one({"_id": ObjectId(pdf_id), "user_id": request.user_id})
    if not pdf:
        return jsonify({"error": "PDF file not found"}), 404
    
    if "summary" in pdf:
        return jsonify(pdf["summary"]), 200

    try:
        summary_data = generate_summary(pdf["text"])
        pdfs_col.update_one({"_id": ObjectId(pdf_id)}, {"$set": {"summary": summary_data}})
        return jsonify(summary_data), 200
    except Exception as e:
        return jsonify({"error": f"AI generation failed: {str(e)}"}), 500

@ai_bp.route("/chat", methods=["POST"])
@token_required
def chat_with_pdf():
    data = request.json or {}
    pdf_id = data.get("pdf_id")
    message = data.get("message")

    if not pdf_id or not message:
        return jsonify({"error": "pdf_id and message are required"}), 400

    pdf = pdfs_col.find_one({"_id": ObjectId(pdf_id), "user_id": request.user_id})
    if not pdf:
        return jsonify({"error": "PDF not found"}), 404

    # Fetch previous messages for short-term session memory context
    session = chats_col.find_one({"user_id": request.user_id, "pdf_id": pdf_id})
    history = []
    if session:
        history = session.get("messages", [])

    try:
        reply = answer_chat_from_pdf(pdf["text"], message, history)
        
        # Save to interaction thread history
        if not session:
            chats_col.insert_one({
                "user_id": request.user_id,
                "pdf_id": pdf_id,
                "messages": [{"user": message, "ai": reply}],
                "updated_at": datetime.datetime.utcnow().isoformat()
            })
        else:
            chats_col.update_one(
                {"_id": session["_id"]},
                {
                    "$push": {"messages": {"user": message, "ai": reply}},
                    "$set": {"updated_at": datetime.datetime.utcnow().isoformat()}
                }
            )
        return jsonify({"reply": reply}), 200
    except Exception as e:
        return jsonify({"error": f"AI Chat Failed: {str(e)}"}), 500

@ai_bp.route("/quiz/<pdf_id>", methods=["GET"])
@token_required
def get_quiz(pdf_id):
    pdf = pdfs_col.find_one({"_id": ObjectId(pdf_id), "user_id": request.user_id})
    if not pdf:
        return jsonify({"error": "PDF not found"}), 404

    existing_quiz = quizzes_col.find_one({"pdf_id": pdf_id, "user_id": request.user_id})
    if existing_quiz:
        return jsonify(existing_quiz["data"]), 200

    try:
        quiz_data = generate_quiz_json(pdf["text"])
        quizzes_col.insert_one({
            "user_id": request.user_id,
            "pdf_id": pdf_id,
            "data": quiz_data,
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        return jsonify(quiz_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to generate quiz: {str(e)}"}), 500

@ai_bp.route("/flashcards/<pdf_id>", methods=["GET"])
@token_required
def get_flashcards(pdf_id):
    pdf = pdfs_col.find_one({"_id": ObjectId(pdf_id), "user_id": request.user_id})
    if not pdf:
        return jsonify({"error": "PDF not found"}), 404

    existing = flashcards_col.find_one({"pdf_id": pdf_id, "user_id": request.user_id})
    if existing:
        return jsonify(existing["data"]), 200

    try:
        flash_data = generate_flashcards_json(pdf["text"])
        flashcards_col.insert_one({
            "user_id": request.user_id,
            "pdf_id": pdf_id,
            "data": flash_data,
            "created_at": datetime.datetime.utcnow().isoformat()
        })
        return jsonify(flash_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to generate cards: {str(e)}"}), 500

@ai_bp.route("/planner", methods=["POST"])
@token_required
def generate_planner():
    data = request.json or {}
    exam_date = data.get("exam_date")
    subjects = data.get("subjects")
    hours = data.get("hours")

    if not exam_date or not subjects or not hours:
        return jsonify({"error": "All fields are required"}), 400

    try:
        plan = generate_study_plan_json(exam_date, subjects, hours)
        planners_col.update_one(
            {"user_id": request.user_id},
            {"$set": {"data": plan, "updated_at": datetime.datetime.utcnow().isoformat()}},
            upsert=True
        )
        return jsonify(plan), 200
    except Exception as e:
        return jsonify({"error": f"Failed to generate planner: {str(e)}"}), 500
