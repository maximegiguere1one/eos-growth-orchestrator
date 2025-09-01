import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type EOSIssue = Tables<'eos_issues'>;
export type EOSIssueInsert = TablesInsert<'eos_issues'>;
export type EOSIssueUpdate = TablesUpdate<'eos_issues'>;

export const ISSUE_STATUS_OPTIONS = [
  { value: 'open' as const, label: 'Open' },
  { value: 'resolved' as const, label: 'Resolved' },
];

export const PRIORITY_OPTIONS = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Critical' },
];