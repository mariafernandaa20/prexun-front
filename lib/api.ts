import axiosInstance from "./api/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";
import { Campus, Carrera, Facultad, Modulo, Municipio, Period, Prepa, Student, Transaction, User } from "./types";

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
  console.log(response.data);
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

export const getCharges = async (campus_id: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.GET_CHARGES}/${campus_id}`);
  return response.data;
};

export const createCharge = async (charge: Transaction) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CHARGE, charge);
  return response.data;
};

export const getMunicipios = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.MUNICIPIOS);
  return response.data;
};

export const createMunicipio = async (municipio: Municipio) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_MUNICIPIO, municipio);
  return response.data;
};

export const updateMunicipio = async (municipio: Municipio) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_MUNICIPIO}/${municipio.id}`,
    municipio
  );
  return response.data;
};

export const deleteMunicipio = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_MUNICIPIO}/${id}`
  );
  return response.data;
};

export const getPrepas = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PREPAS);
  return response.data;
};

export const createPrepa = async (prepa: Prepa) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_PREPA, prepa);
  return response.data;
};

export const updatePrepa = async (prepa: Prepa) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_PREPA}/${prepa.id}`,
    prepa
  );
  return response.data;
};

export const deletePrepa = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_PREPA}/${id}`
  );
  return response.data;
};

export const getFacultades = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.FACULTADES);
  return response.data;
};

export const createFacultad = async (facultad: Facultad) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_FACULTAD, facultad);
  return response.data;
};

export const updateFacultad = async (facultad: Facultad) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_FACULTAD}/${facultad.id}`,
    facultad
  );
  return response.data;
};

export const deleteFacultad = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_FACULTAD}/${id}`
  );
  return response.data;
};

export const getCarreras = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.CARREERAS);
  console.log(response.data);
  return response.data;
};

export const createCarrera = async (carrera: Carrera) => {
  console.log(carrera);
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CARREERA, carrera);
  return response.data;
};

export const updateCarrera = async (carrera: Carrera) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_CARREERA}/${carrera.id}`,
    carrera
  );
  return response.data;
};

export const deleteCarrera = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_CARREERA}/${id}`
  );
  return response.data;
};

export const getModules = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.MODULOS);
  return response.data;
};

export const createModule = async (modulo: Modulo) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_MODULO, modulo);
  return response.data;
};

export const updateModule = async (modulo: Modulo) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_MODULO}/${modulo.id}`,
    modulo
  );
  return response.data;
};

export const deleteModule = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_MODULO}/${id}`
  );
  return response.data;
};

export const associateModulos = async (carreraId: string, moduloIds: string[]) => {
  const response = await axiosInstance.post(
    `${API_ENDPOINTS.CARREERAS}/${carreraId}/modulos`,
    moduloIds
  );
  return response.data;
};

export const dissociateModulo = async (carreraId: string, moduloId: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.CARREERAS}/${carreraId}/modulos/${moduloId}`
  );
  return response.data;
};
