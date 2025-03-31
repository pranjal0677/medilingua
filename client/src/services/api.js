// client/src/services/api.js
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the token from Clerk
      const token = await window.Clerk?.session?.getToken({ template: "medilingua-api" });
      if (!token) {
        console.error('No Clerk token available');
        throw new Error('Authentication required');
      }
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      console.error('Error getting Clerk token:', error);
      // Redirect to sign-in if not authenticated
      if (error.message === 'Authentication required') {
        window.location.href = '/sign-in';
      }
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized request');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export const medicalService = {
  // Medical terms and reports
  async simplifyTerm(term) {
    try {
      console.log('Sending term for simplification:', term);
      const response = await api.post('/simplify-term', { term });
      console.log('Received simplified term:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // History methods
  async getHistory() {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (error) {
      console.error('Get History Error:', error);
      throw error;
    }
  },

  async addTermToHistory(term, simplifiedTerm) {
    try {
      const response = await api.post('/history/terms', { term, simplifiedTerm });
      return response.data;
    } catch (error) {
      console.error('Add Term Error:', error);
      throw error;
    }
  },

  async deleteHistoryEntry(entryId) {
    try {
      const response = await api.delete(`/history/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete history entry:', error);
      throw error;
    }
  },

  async clearHistory() {
    try {
      const response = await api.delete('/history');
      return response.data;
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  },

  async analyzeReport(reportText) {
    try {
      console.log('Sending report for analysis:', reportText);
      const response = await api.post('/analyze-report', { reportText });
      console.log('Received analysis:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async addReportToHistory(report, analysis) {
    try {
      const response = await api.post('/history/reports', { report, analysis });
      return response.data;
    } catch (error) {
      console.error('Add Report Error:', error);
      throw error;
    }
  }
};