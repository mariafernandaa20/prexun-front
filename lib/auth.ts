"use client";

import axiosInstance from './api/axiosConfig';
import { AUTH_ENDPOINTS } from './api/endpoints';
import Cookies from 'js-cookie';

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      if (response.data.token) {
        Cookies.set('auth-token', response.data.token, { expires: 7 });
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, {
        name,
        email,
        password,
        password_confirmation,
      });
      if (response.data.token) {
        Cookies.set('auth-token', response.data.token, { expires: 7 });
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
      Cookies.remove('auth-token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email: string, password: string, password_confirmation: string, token: string) => {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
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
      await axiosInstance.post(AUTH_ENDPOINTS.RESEND_VERIFICATION);
    } catch (error) {
      throw error;
    }
  },

  getUser: async () => {
    try {
      const response = await axiosInstance.get(`${AUTH_ENDPOINTS.USER}`); 
      return response.data;
    } catch (error) {
      Cookies.remove('auth-token');
      return null;
    }
  },

  isAuthenticated: () => {
    return !!Cookies.get('auth-token');
  },

  getToken: () => {
    return Cookies.get('auth-token');
  },
};