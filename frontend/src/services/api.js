import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const deviceService = {
  getAll: () => api.get('/devices'),
  getById: (id) => api.get(`/devices/${id}`),
  create: (deviceData) => api.post('/devices', deviceData),
  update: (id, deviceData) => api.put(`/devices/${id}`, deviceData),
  delete: (id) => api.delete(`/devices/${id}`),
  getMetrics: (id, range = '24h') => api.get(`/devices/${id}/metrics?range=${range}`),
  getAlerts: (id) => api.get(`/devices/${id}/alerts`),
};

export const alertService = {
  getAll: () => api.get('/alerts'),
  acknowledge: (id, data = {}) => api.put(`/alerts/${id}/acknowledge`, data),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const topologyService = {
  getTopology: () => api.get('/topology'),
  addConnection: (conn) => api.post('/topology/connections', conn),
  deleteConnection: (id) => api.delete(`/topology/connections/${id}`),
};

export const metricsService = {
  getRecent: (limit = 100) => api.get(`/metrics?limit=${limit}`),
};

export const reportService = {
  getSummary: () => api.get('/reports'),
  getExportCsvUrl: () => `${API_BASE_URL}/reports/export-csv`,
};

export const demoService = {
  getScenario: () => api.get('/demo/scenario'),
  setScenario: (scenario, deviceId = null) => api.post('/demo/scenario', { scenario, deviceId }),
};

export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const analysisService = {
  getForAlert: (alertId) => api.get(`/analysis/alert/${alertId}`),
  getForDevice: (deviceId) => api.get(`/analysis/device/${deviceId}`),
  evaluateCustom: (metrics) => api.post('/analysis/evaluate', metrics),
  getBenchmarks: () => api.get('/analysis/benchmarks'),
};

export default api;
