from flask import Blueprint, jsonify, request
from routes.auth import token_required
from utils.db import users_col
from bson import ObjectId

user_bp = Blueprint("user", __name__)

@user_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    user = users_col.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "name": user["name"],
        "email": user["email"],
        "streak": user.get("streak", 1),
        "profile_photo": user.get("profile_photo", "")
    }), 200
