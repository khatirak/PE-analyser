import os
from werkzeug.utils import secure_filename
from config import Config

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def secure_filename_safe(filename):
    """Securely handle filename"""
    return secure_filename(filename)

def ensure_upload_directory():
    """Ensure upload directory exists"""
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)

def get_file_extension(filename):
    """Get file extension from filename"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else None 