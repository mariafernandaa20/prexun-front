export interface Campus {
  id?: number;
  titular?: string;
  rfc?: string;
  name: string;
  code: string;
  address?: string;
  is_active: boolean;
  administrator?: string[];
  description?: string;
  admin_ids?: string[];
  folio_inicial: number;
  latest_cash_register?: Caja | null;
  users?: User[];
  grupo_ids?: string[];
  grupos?: Grupo[];
}

export enum PaymentMethod {
  cash = 'Efectivo',
  transfer = 'Transferencia',
  card = 'Tarjeta',
}
interface campus {
  grupo_ids: { id: string[]; name: string }[];
}
export type UserRole =
  | 'admin'
  | 'user'
  | 'super_admin'
  | 'contador'
  | 'maestro'
  | 'proveedor'
  | 'otro'
  | 'chatbot';

export interface UserFormData {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  campuses: string[];
  grupos?: string[];
  suspendido?: boolean;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  campuses?: Campus[];
  grupos?: Grupo[];
  suspendido?: boolean;
}

export interface Student {
  id?: string | null;
  period_id?: string | null;
  period?: Period;
  promo_id?: number;
  grupo_id?: number;
  username?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  campus_id: number;
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
  period_assignments?: any[];
  carrera?: Carrera;
  general_book?:
    | null
    | 'No entregado'
    | 'En fisico'
    | 'En línea'
    | 'En línea y en fisico';
  module_book?:
    | null
    | 'No entregado'
    | 'En fisico'
    | 'En línea'
    | 'En línea y en fisico';
  transactions?: Transaction[];
  grupo?: Grupo;
  semana_intensiva_id: number | null;
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
  description: string;
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
  campuses?: string[] | Campus[];
  id?: number;
  name: string;
  type: string;
  period_id: number;
  plantel_id: number;
  capacity: number;
  frequency: string[];
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  students_count?: number;
  moodle_id: number | null;
  active_assignments_count?: number;
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
  denominations?: null;
  cash_register_id?: number;
  image?: string | File;
  signature?: string; // Base64 or URL
  user?: User;
  admin?: User;
}
export interface Note {
  id?: number;
  student_id: number;
  text: string;
  created_at?: string;
  updated_at?: string;
  student?: Student;
  user?: User;
}

export interface Transaction {
  id?: number;
  uuid?: string;
  product_id?: number;
  student_id: number;
  campus_id: number;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'card';
  denominations?: Record<string, number> | [];
  paid: number;
  payment_date: string | null;
  created_at?: string;
  expiration_date?: string;
  notes?: string;
  transaction_type?: string;
  debt_id?: number | null;
  folio?: number;
  folio_cash?: string;
  folio_card?: string;
  folio_transfer?: string;
  student?: Student;
  cash_register_id?: number;
  folio_new?: string;
  image?: string | File;
  card_id?: string;
}

export interface Card {
  id?: number;
  number: string;
  campus_id: number;
  name: string;
  clabe: string;
  sat: boolean;
}

export interface Denomination {
  1000: number;
  500: number;
  200: number;
  100: number;
  50: number;
  20: number;
  10: number;
  5: number;
  2: number;
  1: number;
}

export interface Producto {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  campus_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudentAssignment {
  carrer_id: number;
  book_delivered?: boolean;
  book_delivery_type?: string;
  book_delivery_date?: string;
  book_notes?: string;
  id?: number;
  student_id: string;
  grupo_id?: number | null;
  semana_intensiva_id?: number | null;
  period_id: string;
  assigned_at: string;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;

  // Relations
  student?: Student;
  grupo?: Grupo;
  semanaIntensiva?: SemanaIntensiva;
  period?: Period;
}

export interface SemanaIntensiva {
  id?: number;
  name: string;
  type: string;
  plantel_id?: number | null;
  period_id: number;
  capacity: number;
  frequency?: string[] | null;
  start_time?: string | null;
  end_time?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  moodle_id?: number | null;
  students_count?: number;
  available_slots?: number;
  is_almost_full?: boolean;
  is_full?: boolean;

  // Relations
  period?: Period;
  students?: Student[];
}

export interface Caja {
  id?: number;
  campus_id: number;
  initial_amount: number;
  initial_amount_cash?: string | Denomination;
  final_amount?: number;
  final_amount_cash?: string | Denomination;
  next_day?: number;
  next_day_cash?: string | Denomination;
  notes?: string;
  opened_at?: string;
  closed_at?: string;
  status: 'abierta' | 'cerrada';
  created_at?: string;
  updated_at?: string;
  transactions?: Transaction[];
  gastos?: Gasto[];
}

export interface SiteSetting {
  id?: number;
  key: string;
  label: string;
  value: string | null;
  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'select'
    | 'json'
    | 'textarea'
    | 'email'
    | 'url'
    | 'password';
  description?: string;
  options?: Record<string, string> | null;
  group: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  parsed_value?: any; // Valor parseado según el tipo
}

export interface SiteSettingGroup {
  [key: string]: SiteSetting[];
}

export interface SiteSettingFormData {
  key: string;
  label: string;
  value: string | null;
  type: SiteSetting['type'];
  description?: string;
  options?: Record<string, string>;
  group: string;
  sort_order?: number;
}
