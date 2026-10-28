import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cleanUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth Services
export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const registerApi = (userData) => api.post('/auth/register', userData);
export const getMeApi = () => api.get('/auth/me');

// User & Role Services
export const getUsersApi = () => api.get('/users');
export const updateUserApi = (id, userData) => api.put(`/users/${id}`, userData);
export const getRBACMatrixApi = () => api.get('/users/rbac-matrix');

// Employee Services
export const getEmployeesApi = (params) => api.get('/employees', { params });
export const getEmployeeByIdApi = (id, revealSensitive = false) =>
    api.get(`/employees/${id}`, { params: { revealSensitive } });
export const createEmployeeApi = (employeeData) => api.post('/employees', employeeData);
export const updateEmployeeApi = (id, employeeData) => api.put(`/employees/${id}`, employeeData);
export const deleteEmployeeApi = (id) => api.delete(`/employees/${id}`);
export const exportEmployeesDataApi = (purpose) =>
    api.get('/employees/export/data', { params: { purpose } });

// Privacy Audit Services
export const getPrivacyAuditApi = () => api.get('/privacy/audit');
export const runPrivacyScanApi = () => api.post('/privacy/audit/run');

// Security Audit Services
export const getSecurityAuditApi = () => api.get('/security/audit');
export const runSecurityScanApi = () => api.post('/security/audit/run');

// Audit Findings & Remediation Services
export const getFindingsApi = (params) => api.get('/findings', { params });
export const getFindingByIdApi = (id) => api.get(`/findings/${id}`);
export const updateFindingRemediationApi = (id, data) => api.put(`/findings/${id}`, data);

// Risk Management Services
export const getRisksApi = () => api.get('/risks');
export const createRiskApi = (riskData) => api.post('/risks', riskData);
export const updateRiskApi = (id, riskData) => api.put(`/risks/${id}`, riskData);

// Audit Logs Services
export const getAuditLogsApi = (params) => api.get('/audit-logs', { params });
export const getAuditStatsApi = () => api.get('/audit-logs/stats');

// Consent Services
export const getConsentsApi = (employeeId) =>
    api.get('/consent', { params: { employeeId } });
export const updateConsentApi = (consentData) => api.put('/consent', consentData);
export const getAllConsentsApi = () => api.get('/consent/all');

// Retention & Policy Services
export const getRetentionStatusApi = () => api.get('/retention');
export const updateRetentionPolicyApi = (policyData) => api.put('/retention/policy', policyData);
export const runRetentionScanApi = () => api.post('/retention/scan');
export const approveRetentionActionApi = (payload) => api.post('/retention/approve', payload);

// Security Alerts & Notifications Services
export const getAlertsApi = () => api.get('/alerts');
export const markAlertReadApi = (id) => api.put(`/alerts/${id}/read`);

// Report Services
export const getReportApi = () => api.get('/reports/full');

// Settings Services
export const getSettingsApi = () => api.get('/settings');
export const updateSettingsApi = (settingsData) => api.put('/settings', settingsData);

// Dashboard Services
export const getDashboardOverviewApi = () => api.get('/dashboard/overview');

export default api;