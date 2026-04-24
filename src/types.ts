export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface GemReport {
  id: string;
  report_id: string;
  client_name: string;
  gem_type: string;
  shape: string;
  cut: string;
  weight: number;
  dimension: string;
  color: string;
  clarity: string;
  transparency: string;
  magnification: string;
  refractive_index: string;
  origin: string;
  treatment: string;
  description: string;
  image_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
  data_hash: string;
}
