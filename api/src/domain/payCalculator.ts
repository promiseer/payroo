import { TimesheetEntry, CalculatedHours } from './types.js';

/**
 * Parse time string to minutes
 * @param time - Time in HH:MM format
 * @returns Minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Calculate worked minutes for a timesheet entry
 * @param entry - The timesheet entry
 * @returns Total worked minutes
 */
export function calculateWorkedMinutes(entry: TimesheetEntry): number {
  const startMinutes = parseTimeToMinutes(entry.start);
  const endMinutes = parseTimeToMinutes(entry.end);
  const totalMinutes = endMinutes - startMinutes;
  const workedMinutes = totalMinutes - entry.unpaidBreakMins;
  
  return Math.max(0, workedMinutes);
}

/**
 * Convert minutes to hours (rounded to 2 decimal places)
 * @param minutes - Minutes to convert
 * @returns Hours as decimal
 */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

/**
 * Calculate total hours from timesheet entries
 * @param entries - Array of timesheet entries
 * @returns Object with normal and overtime hours
 */
export function calculateHours(entries: TimesheetEntry[]): CalculatedHours {
  const totalMinutes = entries.reduce((sum, entry) => {
    return sum + calculateWorkedMinutes(entry);
  }, 0);

  const totalHours = minutesToHours(totalMinutes);
  const overtimeThreshold = 38;
  
  if (totalHours <= overtimeThreshold) {
    return {
      normalHours: totalHours,
      overtimeHours: 0
    };
  }

  return {
    normalHours: overtimeThreshold,
    overtimeHours: Math.round((totalHours - overtimeThreshold) * 100) / 100
  };
}

/**
 * Calculate gross pay for hourly employee
 * @param normalHours - Normal hours worked
 * @param overtimeHours - Overtime hours worked
 * @param baseRate - Base hourly rate
 * @param allowances - Additional allowances
 * @returns Gross pay amount
 */
export function calculateGrossPay(
  normalHours: number,
  overtimeHours: number,
  baseRate: number,
  allowances: number = 0
): number {
  const normalPay = normalHours * baseRate;
  const overtimePay = overtimeHours * baseRate * 1.5;
  const gross = normalPay + overtimePay + allowances;
  
  return Math.round(gross * 100) / 100;
}
