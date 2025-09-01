
import { z } from 'zod';

// Base validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date format',
});

// EOS entity validation schemas
export const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.number().min(0).max(10, 'Priority must be between 0 and 10'),
  assigned_to: uuidSchema.optional(),
  status: z.enum(['open', 'resolved']).default('open'),
});

export const rockSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  owner_id: uuidSchema.optional(),
  progress: z.number().min(0).max(100, 'Progress must be between 0 and 100'),
  status: z.enum(['not_started', 'on_track', 'at_risk', 'completed']).default('not_started'),
  start_date: dateSchema.optional(),
  due_date: dateSchema.optional(),
});

export const kpiSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  unit: z.string().max(20, 'Unit too long').optional(),
  direction: z.enum(['up', 'down']).default('up'),
  target: z.number().optional(),
  position: z.number().min(0, 'Position must be positive'),
  is_active: z.boolean().default(true),
});

export const kpiValueSchema = z.object({
  kpi_id: uuidSchema,
  week_start_date: dateSchema,
  value: z.number(),
});

export const todoSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  assigned_to: uuidSchema.optional(),
  due_date: dateSchema.optional(),
});

export const meetingSchema = z.object({
  status: z.enum(['planned', 'in_progress', 'ended']).default('planned'),
  agenda: z.array(z.object({
    key: z.string(),
    title: z.string(),
    minutes: z.number().min(1),
  })).default([
    { key: 'segue', title: 'Segue', minutes: 5 },
    { key: 'scorecard', title: 'Scorecard review', minutes: 5 },
    { key: 'rocks', title: 'Rock review', minutes: 5 },
    { key: 'headlines', title: 'Customer/employee headlines', minutes: 5 },
    { key: 'todos', title: 'To-do list', minutes: 5 },
    { key: 'ids', title: 'Issues solving (IDS)', minutes: 60 },
    { key: 'conclude', title: 'Conclude', minutes: 5 },
  ]),
});

export const meetingNoteSchema = z.object({
  meeting_id: uuidSchema,
  item_type: z.string().max(50, 'Item type too long').optional(),
  note: z.string().min(1, 'Note is required').max(2000, 'Note too long'),
});

// Profile and auth schemas
export const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100, 'Name too long'),
  email: emailSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  display_name: z.string().min(1, 'Display name is required').max(100, 'Name too long'),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Utility function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Safe validation that returns success/error
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { 
      success: false, 
      errors: result.error.errors.map(e => e.message) 
    };
  }
}

// Form field validation helpers
export const fieldValidators = {
  required: (message = 'This field is required') => 
    (value: any) => value ? undefined : message,
    
  email: (message = 'Invalid email format') =>
    (value: string) => emailSchema.safeParse(value).success ? undefined : message,
    
  minLength: (min: number, message?: string) =>
    (value: string) => value?.length >= min ? undefined : message || `Must be at least ${min} characters`,
    
  maxLength: (max: number, message?: string) =>
    (value: string) => value?.length <= max ? undefined : message || `Must be no more than ${max} characters`,
    
  number: (message = 'Must be a valid number') =>
    (value: any) => !isNaN(Number(value)) ? undefined : message,
    
  range: (min: number, max: number, message?: string) =>
    (value: number) => (value >= min && value <= max) ? undefined : 
      message || `Must be between ${min} and ${max}`,
};

export type ValidationSchema<T> = z.ZodSchema<T>;
export type ValidationResult<T> = z.SafeParseReturnType<unknown, T>;
