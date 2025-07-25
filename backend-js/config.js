const path = require('path');

const config = {
  // Server settings
  PORT: process.env.PORT || 5001,
  SECRET_KEY: process.env.SECRET_KEY || 'dev-secret-key',
  
  // File upload settings
  UPLOAD_FOLDER: 'uploads',
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB max file size
  ALLOWED_EXTENSIONS: ['.csv'],
  
  // CORS settings
  CORS_ORIGINS: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:5000',
    'https://*.vercel.app',
    'https://*.vercel.app/*'
  ],
  
  // Data validation
  EXPECTED_COLUMNS: [
    'Pharmacy', 'Cluster', 'Acquisition_Date', 'Metric', 
    'Fiscal_Year', 'Quarter', 'Date', 'Value'
  ],
  
  // Chart configuration
  CHART_COLORS: [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ],
  
  // Date formats
  DATE_FORMAT: 'MMM-YY',
  FISCAL_YEAR_PREFIX: 'FY'
};

module.exports = config; 