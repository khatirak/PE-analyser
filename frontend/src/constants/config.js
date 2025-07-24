// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  ENDPOINTS: {
    UPLOAD: '/upload',
    STATS: '/api/stats',
    PHARMACIES: '/api/pharmacies',
    CLUSTERS: '/api/clusters',
    METRICS: '/api/metrics',
    REVENUE_DATA: '/api/revenue-data',
    REVENUE_BY_PERIOD: '/api/revenue-by-period',
    TOTAL_REVENUE_DATA: '/api/total-revenue-data',
    SELECTED_METRIC_DATA: '/api/selected-metric-data',
    MONTHLY_REVENUE: '/api/monthly-revenue',
    CHART_DATA: '/api/chart-data'
  }
};

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#06B6D4'
  },
  ANIMATION: {
    DURATION: 300,
    EASING: 'easeInOutQuart'
  }
};

// View Types
export const VIEW_TYPES = {
  MONTH: 'month',
  FISCAL_YEAR: 'fiscal_year',
  QUARTER: 'quarter'
};

// Pharmacy Status
export const PHARMACY_STATUS = {
  ACQUIRED: 'Acquired',
  PIPELINE: 'Pipeline'
};

// Date Formats
export const DATE_FORMATS = {
  MONTH: 'MMM-YY',
  FISCAL_YEAR: 'FY',
  QUARTER: 'Q'
};

// File Upload
export const UPLOAD_CONFIG = {
  ALLOWED_TYPES: ['.csv'],
  MAX_SIZE: 16 * 1024 * 1024, // 16MB
  ACCEPT: '.csv'
};

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  CARD_SPACING: 24,
  BORDER_RADIUS: 8
}; 