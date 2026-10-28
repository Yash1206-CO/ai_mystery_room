import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createCase = async (premise, difficulty) => {
  const response = await api.post('/cases', { premise, difficulty });
  return response.data;
};

export const getCase = async (id) => {
  const response = await api.get(`/cases/${id}`);
  return response.data;
};

export const discoverClue = async (caseId, clueId) => {
  const response = await api.post(`/cases/${caseId}/clues/${clueId}/discover`);
  return response.data;
};

export const requestHint = async (caseId) => {
  const response = await api.post(`/cases/${caseId}/hints`);
  return response.data;
};

export const submitAccusation = async (caseId, accusedSuspectId, notes) => {
  const response = await api.post(`/cases/${caseId}/accuse`, { accusedSuspectId, notes });
  return response.data;
};

export const getCaseResult = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/result`);
  return response.data;
};

export default api;
