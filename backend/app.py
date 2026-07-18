import os
import sys

# Current script (app.py) ki absolute directory path nikal kar sys.path mein daal rahe hain
# Isse Python ko 'routes' aur 'utils' folders direct root directory par mil jayenge
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Ab Python bina kisi ModuleNotFoundError ke inhe load kar lega
from routes.auth import auth_bp
from routes.pdf import pdf_bp
from routes.ai import ai_bp
from routes.user import user_bp

app = Flask(__name__)
# ... (baki ka niche ka code bilkul pehle jaisa same rehne dein)
# ... (baki ka bacha hua code bilkul pehle jaisa hi rehne dein)
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
