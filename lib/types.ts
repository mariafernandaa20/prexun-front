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