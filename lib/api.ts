import axiosInstance from "./api/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";
import { Campus, Period, Student, User } from "./types";

export const getDashboardData = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD);
  console.log(response.data);
  return response.data;
};

export const getUsers = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USERS);
  console.log(response.data);
  return response.data;
};

export const createUser = async (user: User) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_USER, user);
  console.log(response.data);
  return response.data;
};

export const updateUser = async (user: User) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_USER}/${user.id}`,
    user
  );
  console.log(response.data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_USER}/${id}`
  );
  console.log(response.data);
  return response.data;
};

export const getCampuses = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.CAMPUSES);
  console.log(response.data);
  return response.data;
};

export const createCampus = async (campus: Campus) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.CREATE_CAMPUS,
    campus
  );
  console.log(response.data);
  return response.data;
};

export const updateCampus = async (campus: Campus) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_CAMPUS}/${campus.id}`,
    campus
  );
  console.log(response.data);
  return response.data;
};

export const deleteCampus = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_CAMPUS}/${id}`
  );
  console.log(response.data);
  return response.data;
};

export const getStudents = async (campus_id: string) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.STUDENTS}/${campus_id}`
  );
  return response.data;
};

export const createStudent = async (student: Student) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.CREATE_STUDENT,
    student
  );
  return response.data;
};

export const importStudents = async (file: File, campus_id: string) => {
  console.log(file, campus_id);
  const formData = {
    file,
    campus_id
  }

  console.log(formData);
  const response = await axiosInstance.post(
    API_ENDPOINTS.IMPORT_STUDENTS,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};

export const updateStudent = async (student: Student) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_STUDENT}/${student.id}`,
    student
  );
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_STUDENT}/${id}`
  );
  return response.data;
};

export const getStudentsByCohort = async (cohortId: string) => {
  const endpoint = API_ENDPOINTS.STUDENTS_BY_COHORT.replace(
    ":cohortId",
    cohortId
  );
  const response = await axiosInstance.get(endpoint);
  return response.data;
};

export const getActiveStudents = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.ACTIVE_STUDENTS);
  return response.data;
};

export const getCohorts = async () => {
  return [];
};

export const getPeriods = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PERIODS);
  return response.data;
};

export const createPeriod = async (period: Period) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_PERIOD, period);
  return response.data;
};

export const updatePeriod = async (period: Period) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_PERIOD}/${period.id}`,
    period
  );
  return response.data;
};

export const deletePeriod = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_PERIOD}/${id}`
  );
  return response.data;
};

