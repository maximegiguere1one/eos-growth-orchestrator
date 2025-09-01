import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type EOSRock = Tables<'eos_rocks'>;
export type EOSRockInsert = TablesInsert<'eos_rocks'>;
export type EOSRockUpdate = TablesUpdate<'eos_rocks'>;

export const ROCK_STATUS_OPTIONS = [
  { value: 'not_started' as const, label: 'Not Started' },
  { value: 'on_track' as const, label: 'On Track' },
  { value: 'at_risk' as const, label: 'At Risk' },
  { value: 'completed' as const, label: 'Completed' },
];