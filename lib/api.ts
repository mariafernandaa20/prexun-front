import axios from "axios";
import axiosInstance from "./api/axiosConfig";
import { API_ENDPOINTS } from "./api/endpoints";
import { Campus, Carrera, Caja, Facultad, Gasto, Grupo, Modulo, Municipio, Note, Period, Prepa, Promocion, Student, Transaction, User, Producto, Denomination } from "./types";

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
  const formatedUser = {
    ...user,
    email: user.email.toLowerCase(),
  }
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_USER, formatedUser);
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

export const getCards = async (campus_id?: number) => {
  const params = campus_id ? { campus_id } : {};
  const response = await axiosInstance.get('/cards', { params });
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

export const getStudents = async ({params}) => {
  const response = await axiosInstance.get(
    API_ENDPOINTS.STUDENTS, {params}
  );
  return response.data;
};

export const checkStudentExists = async (email: string) => {
  const response = await axiosInstance.get(API_ENDPOINTS.STUDENTS, {
    params: {
      search: email,
      perPage: 1
    }
  });
  
  // Check if the email matches exactly (not just contains)
  const exactMatch = response.data.data?.find((student: any) => 
    student.email.toLowerCase() === email.toLowerCase()
  );
  
  return {
    exists: !!exactMatch,
    student: exactMatch
  };
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

export const deleteStudent = async (id: string, permanent: boolean = false) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_STUDENT}/${id}`, {
      params: {
        permanent
      }
    }
  );
  return response.data;
};

export const syncStudentModules = async () => {
  const response = await axiosInstance.post(API_ENDPOINTS.SYNC_STUDENT_MODULES);
  return response.data;
};

export const bulkDeleteStudents = async (studentIds: string[], permanent: boolean = false) => {
  const response = await axiosInstance.post(
    '/students/bulk-destroy',
    {
      student_ids: studentIds,
      permanent
    }
  );
  return response.data;
};

export const bulkUpdateSemanaIntensiva = async (studentIds: string[], semanaIntensivaId: string) => {
  const response = await axiosInstance.post(
    '/students/bulk-update-semana-intensiva',
    {
      student_ids: studentIds,
      semana_intensiva_id: semanaIntensivaId
    }
  );
  return response.data;
};

export const bulkMarkAsActive = async (studentIds: string[]) => {
  const response = await axiosInstance.post(
    '/students/bulk-mark-as-active',
    {
      student_ids: studentIds
    }
  );
  return response.data;
};

export const bulkMarkAsInactive = async (studentIds: string[]) => {
  const response = await axiosInstance.post(
    '/students/bulk-mark-as-inactive',
    {
      student_ids: studentIds
    }
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

export const getCharges = async (campusId: number, page: number, perPage: number, search?: string, payment_method?: string, card_id?: string) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (search) {
      params.append('search', search);
    }

    if (payment_method && payment_method !== 'all') {
      params.append('payment_method', payment_method);
    }

    if (card_id && card_id !== 'all') {
      params.append('card_id', card_id);
    }

    const response = await axiosInstance.get(`/charges/${campusId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching charges:', error);
    throw error;
  }
};

export const createCharge = async (charge: Transaction) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_CHARGE, charge);
  return response.data;
};

export const updateCharge = async (charge: Transaction) => {
  const formData = new FormData();

  formData.append('_method', 'PUT');

  Object.keys(charge).forEach(key => {
    if (charge[key] !== null && charge[key] !== undefined) {
      if (key === 'image' && charge[key] instanceof File) {
        formData.append('image', charge[key]);
      } else if (typeof charge[key] === 'object') {
        formData.append(key, JSON.stringify(charge[key]));
      } else {
        formData.append(key, String(charge[key]));
      }
    }
  });

  const response = await axiosInstance.post(
    `${API_ENDPOINTS.UPDATE_CHARGE}/${charge.id}`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

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
export const getSemanas = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.SEMANAS);
  return response.data;
};

export const createSemanas = async (grupo: Grupo) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_SEMANA, grupo);
  return response.data;
};

export const updateSemanas = async (grupo: Grupo) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_SEMANA}/${grupo.id}`,
    grupo
  );
  return response.data;
};

export const deleteSemanas = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_SEMANA}/${id}`
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

// Student Assignments
export const getStudentAssignments = async (params?: any) => {
  const response = await axiosInstance.get(API_ENDPOINTS.STUDENT_ASSIGNMENTS, { params });
  return response.data;
};

export const getStudentAssignment = async (id: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENT_ASSIGNMENTS}/${id}`);
  return response.data;
};

export const createStudentAssignment = async (assignment: any) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_STUDENT_ASSIGNMENT, assignment);
  return response.data;
};

export const updateStudentAssignment = async (assignment: any) => {
  const response = await axiosInstance.put(
    `${API_ENDPOINTS.UPDATE_STUDENT_ASSIGNMENT}/${assignment.id}`,
    assignment
  );
  return response.data;
};

export const deleteStudentAssignment = async (id: number) => {
  const response = await axiosInstance.delete(
    `${API_ENDPOINTS.DELETE_STUDENT_ASSIGNMENT}/${id}`
  );
  return response.data;
};

export const getStudentAssignmentsByStudent = async (studentId: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENT_ASSIGNMENTS_BY_STUDENT}/${studentId}`);
  return response.data;
};

export const getStudentAssignmentsByPeriod = async (periodId: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENT_ASSIGNMENTS_BY_PERIOD}/${periodId}`);
  return response.data;
};

export const getStudentAssignmentsByGrupo = async (grupoId: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENT_ASSIGNMENTS_BY_GRUPO}/${grupoId}`);
  return response.data;
};

export const getStudentAssignmentsBySemana = async (semanaId: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENT_ASSIGNMENTS_BY_SEMANA}/${semanaId}`);
  return response.data;
};

export const bulkCreateStudentAssignments = async (assignments: any[]) => {
  const response = await axiosInstance.post(API_ENDPOINTS.BULK_CREATE_STUDENT_ASSIGNMENTS, {
    assignments
  });
  return response.data;
};

export const bulkUpdateStudentAssignments = async (assignments: any[]) => {
  const response = await axiosInstance.put(API_ENDPOINTS.BULK_UPDATE_STUDENT_ASSIGNMENTS, {
    assignments
  });
  return response.data;
};

export const toggleStudentAssignmentActive = async (id: number) => {
  const response = await axiosInstance.patch(`${API_ENDPOINTS.TOGGLE_STUDENT_ASSIGNMENT_ACTIVE}/${id}/toggle-active`);
  return response.data;
};

// Site Settings API
export const getSiteSettings = async () => {
  const response = await axiosInstance.get('/site-settings');
  return response.data;
};

export const getSiteSettingsByGroup = async (group: string) => {
  const response = await axiosInstance.get(`/site-settings/group/${group}`);
  return response.data;
};

export const getSiteSettingValue = async (key: string) => {
  const response = await axiosInstance.get(`/site-settings/value/${key}`);
  return response.data;
};

export const createSiteSetting = async (setting: any) => {
  const response = await axiosInstance.post('/site-settings', setting);
  return response.data;
};

export const updateSiteSetting = async (id: number, setting: any) => {
  const response = await axiosInstance.put(`/site-settings/${id}`, setting);
  return response.data;
};

export const updateMultipleSiteSettings = async (settings: any[]) => {
  const response = await axiosInstance.post('/site-settings/update-multiple', { settings });
  return response.data;
};

export const deleteSiteSetting = async (id: number) => {
  const response = await axiosInstance.delete(`/site-settings/${id}`);
  return response.data;
};

export const getUIConfig = async () => {
  const response = await axiosInstance.get('/site-settings/ui-config');
  return response.data;
};

export const getStudentsByAssignedPeriod = async (periodId: string, params: any) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENTS_BY_ASSIGNED_PERIOD}/${periodId}`, { params });
  return response.data;
};

// Student Events API
export const getStudentEvents = async (studentId: string, params?: any) => {
  const response = await axiosInstance.get(`/student-events/${studentId}`, { params });
  return response.data;
};

export const getRecentStudentEvents = async (studentId: string, limit?: number) => {
  const response = await axiosInstance.get(`/student-events/${studentId}/recent/${limit}`);
  return response.data;
};

export const getEventsByType = async (type: string) => {
  const response = await axiosInstance.get(`/student-events/type/${type}`);
  return response.data;
};

export const getMovementEvents = async () => {
  const response = await axiosInstance.get(`/student-events/movement`);
  return response.data;
};

// Notes API
export const getNotes = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.NOTES);
  return response.data;
};

export const getStudentNotes = async (studentId: number) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.STUDENT_NOTES}/${studentId}/notes`);
  return response.data;
};

export const createNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
  const response = await axiosInstance.post(API_ENDPOINTS.CREATE_NOTE, note);
  return response.data;
};

export const updateNote = async (note: Note) => {
  const response = await axiosInstance.put(`${API_ENDPOINTS.UPDATE_NOTE}/${note.id}`, note);
  return response.data;
};

export const deleteNote = async (id: number) => {
  const response = await axiosInstance.delete(`${API_ENDPOINTS.DELETE_NOTE}/${id}`);
  return response.data;
};