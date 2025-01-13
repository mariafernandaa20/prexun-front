import axios from "axios";
import axiosInstance from "./api/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";
import { Campus, Carrera, Caja, Facultad, Gasto, Grupo, Modulo, Municipio, Period, Prepa, Promocion, Student, Transaction, User, Producto, Denomination } from "./types";

export const getDashboardData = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD);
  return response.data;
};

export const getInvoice = async (slug: string) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.INVOICE}/${slug}`);
  return response.data;
};

export const getInvoices = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.INVOICES);
  return response.data;
};

export const getUsers = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.USERS);
  return response.data;
};

export const createUser = async (user: User) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_USER, user);
  return response.data;
};

export const updateUser = async (user: User) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_USER}/${user.id}`,
    user
  );
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_USER}/${id}`
  );
  return response.data;
};

export const getCampuses = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.CAMPUSES);
  return response.data;
};

export const createCampus = async (campus: Campus) => {
  const response = await axiosInstance.post(
    API_ENDPOINTS.CREATE_CAMPUS,
    campus
  );
  return response.data;
};

export const updateCampus = async (campus: Campus) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_CAMPUS}/${campus.id}`,
    campus
  );
  return response.data;
};

export const deleteCampus = async (id: number) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_CAMPUS}/${id}`
  );
  return response.data;
};

export const getStudents = async (campus_id: number) => {
  const response = await axiosInstance.get(
    `${API_ENDPOINTS.STUDENTS}/${campus_id}`
  );
  return response.data;
};
export const getStudent = async (student: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENT}/${student}`);
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
  const formData = {
    file,
    campus_id
  }

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

export const getCharges = async (campus_id: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.GET_CHARGES}/${campus_id}`);
  return response.data;
};

export const createCharge = async (charge: Transaction) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CHARGE, charge);
  return response.data;
};

export const updateCharge = async (charge: Transaction) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.UPDATE_CHARGE}/${charge.id}`, charge);
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
  return response.data;
};

export const createCarrera = async (carrera: Carrera) => {
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

export const getPromos = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PROMOS);
  return response.data;
};

export const createPromo = async (promo: Promocion) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_PROMO, promo);
  return response.data;
};

export const updatePromo = async (promo: Promocion) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_PROMO}/${promo.id}`,
    promo
  );
  return response.data;
};

export const deletePromo = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_PROMO}/${id}`
  );
  return response.data;
};

export const getGrupos = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.GRUPOS);
  return response.data;
};

export const createGrupo = async (grupo: Grupo) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_GRUPO, grupo);
  return response.data;
};

export const updateGrupo = async (grupo: Grupo) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_GRUPO}/${grupo.id}`,
    grupo
  );
  return response.data;
};

export const deleteGrupo = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_GRUPO}/${id}`
  );
  return response.data;
};

export const getGastos = async (campus_id: number | undefined) => {
  const response = await axiosInstance.get(API_ENDPOINTS.GASTOS, { params: { campus_id } });
  return response.data;
};

export const createGasto = async (gasto: Gasto & { image?: File }) => {
  const formData = new FormData();
  
  Object.keys(gasto).forEach(key => {
    if (key === 'image' && gasto.image) {
      formData.append('image', gasto.image);
    } 
    else if (key === 'denominations' && gasto.denominations) {
      formData.append('denominations', JSON.stringify(gasto.denominations));
    }
    else {
      formData.append(key, String(gasto[key as keyof Gasto]));
    }
  });

  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_GASTO, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};


export const updateGasto = async (gasto: Gasto) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_GASTO}/${gasto.id}`,
    gasto
  );
  return response.data;
};

export const deleteGasto = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_GASTO}/${id}`
  );
  return response.data;
};


export const getProductos = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTOS);
  return response.data;
};

export const createProducto = async (producto: Producto) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_PRODUCTO, producto);
  return response.data;
};

export const updateProducto = async (producto: Producto) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_PRODUCTO}/${producto.id}`,
    producto
  );
  return response.data;
};

export const deleteProducto = async (id: number) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_PRODUCTO}/${id}`
  );
  return response.data;
};

export const createCaja = async (caja: Caja) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CAJA, caja);
  return response.data;
};

export const updateCaja = async (caja: Caja) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_CAJA}/${caja.id}`,
    caja
  );
  return response.data;
};

export const getCurrentCaja = async (campus_id: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.CURRENT_CAJA}/${campus_id}`);
  return response.data;
}

export const openCaja = async (
  campusId: number,
  initialAmount: number, 
  initialAmountCash: Denomination,
  notes: string
): Promise<Caja> => {

  console.log(initialAmount, initialAmountCash);
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CAJA, {
    campus_id: campusId,
    initial_amount: initialAmount,
    initial_amount_cash: initialAmountCash,
    notes,
    status: 'abierta',
  });

  return response.data;
};

export const closeCaja = async (
  cajaId: number,
  finalAmount: number,
  finalAmountCash: Denomination,
  next_day: number,
  next_day_cash: Denomination,
  notes: string  
): Promise<Caja> => {

  console.log(finalAmount, finalAmountCash);

  const response = await axiosInstance.put(`${API_ENDPOINTS.UPDATE_CAJA}/${cajaId}`, {
    final_amount: finalAmount,
    final_amount_cash: finalAmountCash,
    next_day,
    next_day_cash,
    notes,
    status: 'cerrada',
  });

  return response.data;
};
