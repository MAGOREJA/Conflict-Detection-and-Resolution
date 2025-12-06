# app.py
import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import db, init_db
from routes.auth import auth_bp
from routes.tasks import tasks_bp
from routes.conflicts import conflicts_bp
from routes.reports import reports_bp  # Reports blueprint with CSV + charts
from flask_jwt_extended import JWTManager

# Initialize JWT Manager
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # ----------------------
    # CORS Configuration
    # ----------------------
    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",")
    CORS(app, supports_credentials=True, origins=cors_origins)

    # ----------------------
    # App Configuration
    # ----------------------
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///conflicts.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'devkey')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')

    # ----------------------
    # Initialize Extensions
    # ----------------------
    db.init_app(app)
    jwt.init_app(app)

    # ----------------------
    # Register Blueprints
    # ----------------------
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(conflicts_bp)
    app.register_blueprint(reports_bp)  # ✅ CSV + charts

    # ----------------------
    # Ensure chart directory exists
    # ----------------------
    os.makedirs('/tmp/charts', exist_ok=True)

    # ----------------------
    # Initialize Database & Seed Data
    # ----------------------
    with app.app_context():
        init_db(app)

    # ----------------------
    # Test Ping Route
    # ----------------------
    @app.route('/api/ping')
    def ping():
        return jsonify({'message': 'pong'})

    return app

# ----------------------
# Run Flask App
# ----------------------
if __name__ == '__main__':
    app = create_app()
    debug_mode = os.getenv('FLASK_DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
