import axios from 'axios';
import axiosInstance from '@/lib/api/axiosConfig';

interface Group {
  id: number;
  name: string;
  type: string;
  start_time: string;
  end_time: string;
  capacity: number;
  frequency: string;
  start_date: string;
  end_date: string;
  students?: Student[];
}

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  matricula: string;
}

export const teacherService = {
  async getTeacherGroups(teacherId: number) {
    try {
      const response = await axiosInstance.get<Group[]>(
        `/teacher/${teacherId}/groups`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener grupos del profesor:', error);
      throw error;
    }
  },
};
