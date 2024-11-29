import axiosInstance from './api/axiosConfig';
import { API_ENDPOINTS } from './api/endpoints';
import { Campus, User } from './types';

export const getUsers = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USERS);
  return response.data;
};

export const createUser = async (user: User) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_USER, user);
  return response.data;
};

export const updateUser = async (user: User) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.UPDATE_USER}/${user.id}`, user);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.DELETE_USER}/${id}`);
  return response.data;
};

export const getCampuses = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.CAMPUSES);
  return response.data;
};

export const createCampus = async (campus: Campus) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CAMPUS, campus);
  return response.data;
};

export const updateCampus = async (campus: Campus) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.UPDATE_CAMPUS}/${campus.id}`, campus);
  return response.data;
};

export const deleteCampus = async (id: string) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.DELETE_CAMPUS}/${id}`);
  return response.data;
};
