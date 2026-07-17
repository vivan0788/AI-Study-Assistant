from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.auth import auth_bp
from routes.pdf import pdf_bp
from routes.ai import ai_bp
from routes.user import user_bp

app = Flask(__name__)
# Enable CORS for frontend clients safely
CORS(app, resources={r"/*": {"origins": "*"}})

# Health check endpoint
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "Study AI API Engine"}), 200

# Blueprints registration
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(pdf_bp, url_prefix="/api/pdf")
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(user_bp, url_prefix="/api/user")

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=Config.PORT, debug=True)
