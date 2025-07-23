from flask import Blueprint, request, jsonify
from services.data_service import data_service
from services.validation_service import validation_service

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Validate file upload
    is_valid, message = validation_service.validate_file_upload(file)
    if not is_valid:
        return jsonify({'error': message}), 400
    
    try:
        # Load data
        success, message = data_service.load_data(file)
        if not success:
            return jsonify({'error': message}), 400
        
        # Validate CSV data
        df = data_service.get_data()
        is_valid, message = validation_service.validate_csv_data(df)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Get basic stats
        stats = data_service.get_stats()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 400 