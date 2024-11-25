"use client";

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Configure axios defaults
axios.defaults.headers.common['Accept'] = 'application/json';

// Add an interceptor to include the token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        name,
        email,
        password,
        password_confirmation,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/api/logout`);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email: string, password: string, password_confirmation: string, token: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/reset-password`, {
        email,
        password,
        password_confirmation,
        token,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resendVerification: async () => {
    try {
      await axios.post(`${API_URL}/email/verification-notification`);
    } catch (error) {
      throw error;
    }
  },

  getUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user`);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },
};
