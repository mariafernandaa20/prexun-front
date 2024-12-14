export interface Campus {
  id?: string;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
  administrator?: string[];
}

export interface User {
  id?: string
  name: string
  email: string
  role: 'user' | 'admin' | 'super-admin'
  campuses?: Campus[]
}

export interface UserFormData {
  id?: string
  name: string
  email: string
  role: 'user' | 'admin' | 'super-admin'
  password?: string
  campuses?: string[]
}

export interface Student {
  id?: string | null;
  period_id: string;
  period?: Period;
  username?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  campus_id: string;
  created_at?: string;
  current_debt?: number;
  type: 'preparatoria' | 'facultad';
  status: 'Activo' | 'Inactivo' | 'Baja' | 'Suspendido' | 'Transferido';
  municipio_id: string;
  facultad_id: string;
  carrer_id: string;
  prepa_id: string;
  tutor_name: string;
  tutor_phone: string;
  tutor_relationship: string;
  average: number;
  attempts: string;
  score: number;
  health_conditions: string;
  how_found_out: string;
  preferred_communication: string;
  municipio?: Municipio;
  prepa?: Prepa;
  facultad?: Facultad;
  carrera?: Carrera;
}

export interface Cohort {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

export interface Period {
  id: string;
  name: string;
  price: number;
  start_date: string;
  end_date: string;
}

export interface Municipio {
  id?: string;
  name: string;
}

export interface Prepa {
  id?: string;
  name: string;
}

export interface Facultad {
  id?: string;
  name: string;
}

export interface Carrera {
  id?: string;
  name: string;
  modulos?: Modulo[];
  modulos_ids?: string[];
  facultad_id: string;
}

export interface Modulo {
  id?: string;
  name?: string;
}

export interface Transaction {
  id?: number;
  student_id: number;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'card';
  denominations?: Record<string, number>;
  created_at?: string;
  notes?: string;
  student?: Student;
}