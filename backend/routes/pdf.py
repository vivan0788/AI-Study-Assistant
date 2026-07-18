from flask import Blueprint, request, jsonify
from routes.auth import token_required
from utils.db import pdfs_col
import pypdf
import io
from bson import ObjectId
import datetime

pdf_bp = Blueprint("pdf", __name__)

@pdf_bp.route("/upload", methods=["POST"])
@token_required
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({"error": "Only PDF files allowed"}), 400

    try:
        # Read PDF content safely in-memory
        pdf_stream = io.BytesIO(file.read())
        reader = pypdf.PdfReader(pdf_stream)
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        
        if len(extracted_text.strip()) < 10:
            return jsonify({"error": "Could not extract sufficient text from PDF."}), 400

        # Save metadata and content to Mongo
        pdf_doc = {
            "user_id": request.user_id,
            "filename": file.filename,
            "text": extracted_text,
            "uploaded_at": datetime.datetime.utcnow().isoformat()
        }
        pdf_id = pdfs_col.insert_one(pdf_doc).inserted_id

        return jsonify({
            "message": "File successfully processed",
            "pdf_id": str(pdf_id),
            "filename": file.filename
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to parse PDF: {str(e)}"}), 500

@pdf_bp.route("/list", methods=["GET"])
@token_required
def list_pdfs():
    pdfs = list(pdfs_col.find({"user_id": request.user_id}))
    serialized_pdfs = []
    for pdf in pdfs:
        serialized_pdfs.append({
            "id": str(pdf["_id"]),
            "filename": pdf["filename"],
            "uploaded_at": pdf.get("uploaded_at")
        })
    return jsonify(serialized_pdfs), 200

@pdf_bp.route("/search", methods=["GET"])
@token_required
def search_pdfs():
    query = request.args.get("q", "")
    if not query:
        return jsonify([]), 200
        
    # Standard text matching within user's documents
    results = list(pdfs_col.find({
        "user_id": request.user_id,
        "filename": {"$regex": query, "$options": "i"}
    }))
    
    serialized = [{"id": str(r["_id"]), "filename": r["filename"]} for r in results]
    return jsonify(serialized), 200
