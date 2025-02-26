import { Student } from '../types';
import axiosInstance from './axiosConfig';

export const updateStudent = async (student: any) => {
  const response = await axiosInstance.patch('/students/hard-update', student);
  return response.data;
};
