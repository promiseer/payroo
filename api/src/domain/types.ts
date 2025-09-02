export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  type: 'hourly';
  baseHourlyRate: number;
  superRate: number;
  bank?: {
    bsb: string;
    account: string;
  };
}

export interface TimesheetEntry {
  date: string; // YYYY-MM-DD format
  start: string; // HH:MM format
  end: string; // HH:MM format
  unpaidBreakMins: number;
}

export interface Timesheet {
  employeeId: string;
  periodStart: string; // YYYY-MM-DD format
  periodEnd: string; // YYYY-MM-DD format
  entries: TimesheetEntry[];
  allowances: number;
}

export interface PayrunRequest {
  periodStart: string; // YYYY-MM-DD format
  periodEnd: string; // YYYY-MM-DD format
  employeeIds?: string[];
}

export interface Payslip {
  employeeId: string;
  normalHours: number;
  overtimeHours: number;
  gross: number;
  tax: number;
  super: number;
  net: number;
}

export interface PayrunTotals {
  gross: number;
  tax: number;
  super: number;
  net: number;
}

export interface Payrun {
  id: string;
  periodStart: string;
  periodEnd: string;
  totals: PayrunTotals;
  payslips: Payslip[];
  createdAt: Date;
}

export interface CalculatedHours {
  normalHours: number;
  overtimeHours: number;
}

export interface PayCalculation {
  gross: number;
  tax: number;
  super: number;
  net: number;
}
