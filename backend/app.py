from flask import Flask, send_from_directory, jsonify
from config import Config
from api.middleware.cors import setup_cors
from api.routes.upload import upload_bp
from api.routes.stats import stats_bp
from api.routes.pharmacy import pharmacy_bp
from api.routes.revenue import revenue_bp
from api.routes.metrics import metrics_bp
from api.routes.chart import chart_bp
from utils.file_utils import ensure_upload_directory
from services.data_service import data_service
import os
# dont want
def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
    
    # Configure app
    app.config.from_object(Config)
    
    # Setup CORS
    setup_cors(app)
    
    # Ensure upload directory exists
    ensure_upload_directory()
    
    # Load sample data if available
    sample_csv_path = os.path.join('uploads', 'Cur8_formulaKhatira.csv')
    if os.path.exists(sample_csv_path):
        try:
            with open(sample_csv_path, 'rb') as file:
                success, message = data_service.load_data(file)
                if success:
                    print(f"✅ Sample data loaded: {message}")
                else:
                    print(f"⚠️  Could not load sample data: {message}")
        except Exception as e:
            print(f"⚠️  Error loading sample data: {str(e)}")
    
    # Register blueprints
    app.register_blueprint(upload_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(pharmacy_bp)
    app.register_blueprint(revenue_bp)
    app.register_blueprint(metrics_bp)
    app.register_blueprint(chart_bp)
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Backend is running'})
    
    return app

app = create_app()

@app.route('/')
def serve():
    """Serve the React frontend"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files for the React app"""
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 