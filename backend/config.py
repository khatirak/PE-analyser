import os

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # File upload settings
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'csv'}
    
    # CORS settings
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5000']
    
    # Data validation
    EXPECTED_COLUMNS = [
        'Pharmacy', 'Cluster', 'Acquisition_Date', 'Metric', 
        'Fiscal_Year', 'Quarter', 'Date', 'Value'
    ]
    
    # Chart configuration
    CHART_COLORS = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ]
    
    # Date formats
    DATE_FORMAT = '%b-%y'
    FISCAL_YEAR_PREFIX = 'FY' 