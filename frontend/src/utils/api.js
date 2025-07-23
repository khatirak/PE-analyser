import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const fetchStats = async () => {
  const response = await api.get('/api/stats');
  return response.data;
};

export const fetchPharmacies = async () => {
  const response = await api.get('/api/pharmacies');
  return response.data;
};

export const fetchChartData = async (params) => {
  const response = await api.get('/api/revenue-data', { params });
  return response.data;
};

export const fetchRevenueByPeriod = async (params) => {
  const response = await api.get('/api/revenue-by-period', { params });
  return response.data;
};

export const fetchMonthlyRevenue = async (params) => {
  const response = await api.get('/api/monthly-revenue', { params });
  return response.data;
}; 