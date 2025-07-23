from flask import Blueprint, jsonify
from services.data_service import data_service

metrics_bp = Blueprint('metrics', __name__)

@metrics_bp.route('/api/metrics')
def get_metrics():
    """Get unique metrics information"""
    metrics = data_service.get_metrics()
    
    if metrics is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    return jsonify(metrics) 