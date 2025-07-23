import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
});

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
  const response = await api.get(API_CONFIG.ENDPOINTS.STATS);
  return response.data;
};

export const fetchPharmacies = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.PHARMACIES);
  return response.data;
};

export const fetchClusters = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.CLUSTERS);
  return response.data;
};

export const fetchMetrics = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.METRICS);
  return response.data;
};

export const fetchChartData = async (params) => {
  const response = await api.get(API_CONFIG.ENDPOINTS.REVENUE_DATA, { params });
  return response.data;
};

export const fetchRevenueByPeriod = async (params) => {
  const response = await api.get(API_CONFIG.ENDPOINTS.REVENUE_BY_PERIOD, { params });
  return response.data;
};

export const fetchMonthlyRevenue = async (params) => {
  const response = await api.get(API_CONFIG.ENDPOINTS.MONTHLY_REVENUE, { params });
  return response.data;
}; 