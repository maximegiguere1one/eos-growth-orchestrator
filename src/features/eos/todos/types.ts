export interface EOSTodo {
  id: string;
  description: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  archived_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type EOSTodoInsert = Omit<EOSTodo, 'id' | 'created_at' | 'updated_at'>;
export type EOSTodoUpdate = Partial<Omit<EOSTodo, 'id' | 'created_by' | 'created_at' | 'updated_at'>>;