from flask import Blueprint, jsonify
from services.data_service import data_service

pharmacy_bp = Blueprint('pharmacy', __name__)

@pharmacy_bp.route('/api/pharmacies')
def get_pharmacies():
    """Get pharmacy information with acquisition status"""
    pharmacies = data_service.get_pharmacies()
    
    if not pharmacies:
        return jsonify({'error': 'No data uploaded'}), 400
    
    return jsonify(pharmacies)

@pharmacy_bp.route('/api/clusters')
def get_clusters():
    """Get cluster information with associated pharmacies"""
    clusters = data_service.get_clusters()
    
    if not clusters:
        return jsonify({'error': 'No data uploaded'}), 400
    
    return jsonify(clusters) 