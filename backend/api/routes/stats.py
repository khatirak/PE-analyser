from flask import Blueprint, jsonify
from services.data_service import data_service

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/api/stats')
def get_stats():
    """Get basic statistics"""
    stats = data_service.get_stats()
    
    if stats is None:
        return jsonify({'error': 'No data uploaded'}), 400
    
    return jsonify(stats) 