import { z } from 'zod';

// Employee validation schema
export const EmployeeSchema = z.object({
  id: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  type: z.literal('hourly'),
  baseHourlyRate: z.number().min(0),
  superRate: z.number().min(0).max(1),
  bank: z.object({
    bsb: z.string().regex(/^\d{3}-\d{3}$/),
    account: z.string().min(6)
  }).optional()
});

// Timesheet entry validation schema
export const TimesheetEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  unpaidBreakMins: z.number().min(0)
});

// Timesheet validation schema
export const TimesheetSchema = z.object({
  employeeId: z.string().min(1),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  entries: z.array(TimesheetEntrySchema),
  allowances: z.number().min(0).default(0)
});

// Payrun request validation schema
export const PayrunRequestSchema = z.object({
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeIds: z.array(z.string()).optional()
});

// Export types from schemas
export type EmployeeInput = z.infer<typeof EmployeeSchema>;
export type TimesheetInput = z.infer<typeof TimesheetSchema>;
export type PayrunRequestInput = z.infer<typeof PayrunRequestSchema>;
