import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
});

// Simple request interceptor for logging only
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Simple response interceptor for logging only
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

// Test with native fetch
export const testFetchConnection = async () => {
  try {
    const testUrl = process.env.NODE_ENV === 'production' ? '/stats' : `${API_CONFIG.BASE_URL}/stats`;
    const response = await fetch(testUrl);
    const data = await response.json();
    return true;
  } catch (error) {
    console.error('Fetch test failed:', error);
    return false;
  }
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(API_CONFIG.ENDPOINTS.UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const fetchStats = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.STATS);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    throw error;
  }
};

export const fetchPharmacies = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.PHARMACIES);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching pharmacies:', error);
    throw error;
  }
};

export const fetchClusters = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.CLUSTERS);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching clusters:', error);
    throw error;
  }
};

export const fetchMetrics = async () => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.METRICS);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching metrics:', error);
    throw error;
  }
};

export const fetchChartData = async (params) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.CHART_DATA, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching chart data:', error);
    throw error;
  }
};

export const fetchRevenueByPeriod = async (params) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.REVENUE_BY_PERIOD, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue by period:', error);
    throw error;
  }
};

export const fetchTotalRevenueData = async (params) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.TOTAL_REVENUE_DATA, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching total revenue data:', error);
    throw error;
  }
};

export const fetchTotalRevenueScoreCardData = async (viewType) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.TOTAL_REVENUE_SCORECARD, { 
      params: { view_type: viewType } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching total revenue score card data:', error);
    throw error;
  }
};

export const fetchSelectedMetricScoreCardData = async (metric, viewType) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.SELECTED_METRIC_SCORECARD, { 
      params: { metric, view_type: viewType } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching selected metric score card data:', error);
    throw error;
  }
};

export const fetchSelectedMetricData = async (params) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.SELECTED_METRIC_DATA, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching selected metric data:', error);
    throw error;
  }
};

export const fetchMonthlyRevenue = async (params) => {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.MONTHLY_REVENUE, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    throw error;
  }
}; 