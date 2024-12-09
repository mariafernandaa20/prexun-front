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
  campuses?: string[]
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
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  campus_id: string;
  type: 'preparatoria' | 'facultad';
  status: 'active' | 'inactive';
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
  start_date: string;
  end_date: string;
}