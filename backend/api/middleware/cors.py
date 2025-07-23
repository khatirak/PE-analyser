from flask_cors import CORS
from config import Config

def setup_cors(app):
    """Setup CORS for the Flask application"""
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True) 