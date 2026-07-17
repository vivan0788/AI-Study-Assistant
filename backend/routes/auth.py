from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import datetime
from utils.db import users_col
from config import Config

auth_bp = Blueprint("auth", __name__)

def encode_token(user_id):
    payload = {
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        "iat": datetime.datetime.utcnow(),
        "sub": str(user_id)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

def token_required(f):
    import functools
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            try:
                token = request.headers["Authorization"].split(" ")[1]
            except IndexError:
                return jsonify({"error": "Invalid token header format"}), 401
        
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        
        try:
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            request.user_id = data["sub"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    return decorated

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user_id = users_col.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "streak": 1,
        "last_active": datetime.datetime.utcnow(),
        "profile_photo": f"https://api.dicebear.com/7.x/bottts/svg?seed={name}"
    }).inserted_id

    token = encode_token(user_id)
    return jsonify({"token": token, "name": name, "email": email}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    user = users_col.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    # Update study streak
    today = datetime.datetime.utcnow().date()
    last_active = user.get("last_active")
    streak = user.get("streak", 1)

    if last_active:
        if isinstance(last_active, str):
            # Parse fallback strings if present
            last_active = datetime.datetime.fromisoformat(last_active.replace("Z", ""))
        last_date = last_active.date()
        if today - last_date == datetime.timedelta(days=1):
            streak += 1
        elif today - last_date > datetime.timedelta(days=1):
            streak = 1
    
    users_col.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_active": datetime.datetime.utcnow(), "streak": streak}}
    )

    token = encode_token(user["_id"])
    return jsonify({
        "token": token,
        "name": user["name"],
        "email": user["email"],
        "streak": streak,
        "profile_photo": user.get("profile_photo")
    }), 200
