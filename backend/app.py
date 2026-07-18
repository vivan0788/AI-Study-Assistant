import sys
import os

# Render par relative imports ko fix karne ke liye path manually force kar rahe hain
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from config import Config

# Pehle agar 'from routes.auth import ...' tha, toh use aise hi rehne dein
# Kyunki humne upar sys.path fix kar diya hai, ab Python ko 'routes' easily mil jayega.
from routes.auth import auth_bp
from routes.pdf import pdf_bp
from routes.ai import ai_bp
from routes.user import user_bp

app = Flask(__name__)
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
