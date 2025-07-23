from flask_cors import CORS
from config import Config

def setup_cors(app):
    """Setup CORS for the Flask application"""
    CORS(app, 
         origins=['*'],  # Allow all origins for development
         supports_credentials=False,  # Disable credentials for now
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         expose_headers=['Content-Type', 'Authorization']) 