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
  promo_id?: number;
  grupo_id?: number;
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
export interface Pago {
  date: string;
  amount: number;
}
export interface Promocion {
  id?: number;
  name: string;
  type: string;
  regular_cost: number;
  cost: number;
  active: boolean;
  limit_date: string;
  pagos: Pago[];
  groups: string[];
}

export interface Grupo {
  id?: number;
  name: string;
  type: string;
  period_id: number;
  plantel_id: number;
  capacity: number;
  frequency: string[];
  start_time: string;
  end_time: string;
}
export interface Gasto {
  id?: number;
  category: string;
  concept: string;
  method: string;
  amount: number;
  date: string;
  campus_id: number;
  admin_id: number;
  user_id: number;
  image?: string | File;
  user?: User;
  admin?: User;
}
export interface Transaction {
  id?: number;
  student_id: number;
  campus_id: number;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'card';
  denominations?: Record<string, number>;
  created_at?: string;
  notes?: string;
  student?: Student;
}

export interface Caja {
  id?: number;
  amount: number;
  final_amount?: number;
  real_amount?: number;
  date?: string;
  campus_id: number;
  created_at?: string;
  updated_at?: string;
}