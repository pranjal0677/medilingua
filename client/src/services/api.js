// client/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request');
    }
    return config;
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
      console.log('Unauthorized request - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const medicalService = {
  // Auth methods
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('Auth data saved');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error('Signup Error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Auth data cleared');
    } catch (error) {
      console.error('Logout Error:', error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Profile Error:', error);
      throw error;
    }
  },

  // Medical terms and reports
  async simplifyTerm(term) {
    try {
      const response = await api.post('/simplify-term', { term });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  

  // History methods
  async getUserHistory() {
    try {
      const response = await api.get('/history'); // Removed extra 'api'
      return response.data;
    } catch (error) {
      console.error('Failed to fetch history:', error);
      throw error;
    }
  },

  async addTermToHistory(term, result) {
    try {
      const response = await api.post('/history/term', { term, result }); // Removed extra 'api'
      return response.data;
    } catch (error) {
      console.error('Failed to save term search:', error);
      throw error;
    }
  },

  

  async deleteHistoryEntry(entryId) {
    try {
      const response = await api.delete(`/history/${entryId}`); // Removed extra 'api'
      return response.data;
    } catch (error) {
      console.error('Failed to delete history entry:', error);
      throw error;
    }
  },

  async clearHistory() {
    try {
      const response = await api.delete('/history'); // Removed extra 'api'
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
  // async analyzeReport(reportText) {
  //   try {
  //     console.log('Sending report for analysis:', reportText);
  //     const response = await api.post('/analyze-report', { reportText });
  //     console.log('Received analysis:', response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('API Error:', error);
  //     throw error;
  //   }
  // },

  async addReportToHistory(data) {
    try {
      console.log('Saving to history:', data); // Debug log
      const response = await api.post('/history/report', {
        reportText: data.reportText,
        result: {
          summary: data.result.summary,
          keyPoints: data.result.keyPoints,
          medicalTerms: data.result.medicalTerms,
          actions: data.result.actions,
          warnings: data.result.warnings
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save report analysis:', error);
      throw error;
    }
  }

  // async addReportToHistory(reportText, analysis) {
    //   try {
    //     const response = await api.post('/history/report', { reportText, analysis }); // Removed extra 'api'
    //     return response.data;
    //   } catch (error) {
    //     console.error('Failed to save report analysis:', error);
    //     throw error;
    //   }
    // },
};