import { Employee, Timesheet, Payrun, Payslip, PayrunTotals } from './types.js';
import { calculateHours, calculateGrossPay } from './payCalculator.js';
import { calculateTax, calculateSuper, calculateNet } from './taxCalculator.js';
import { v4 as uuidv4 } from 'uuid';

export class PayrunService {
  /**
   * Generate a payrun for the given period and employees
   */
  static generatePayrun(
    periodStart: string,
    periodEnd: string,
    employees: Employee[],
    timesheets: Timesheet[]
  ): Payrun {
    const payslips: Payslip[] = [];
    
    for (const employee of employees) {
      // Find timesheet for this employee in the given period
      const employeeTimesheet = timesheets.find(ts => 
        ts.employeeId === employee.id &&
        ts.periodStart === periodStart &&
        ts.periodEnd === periodEnd
      );

      if (!employeeTimesheet) {
        // Create empty payslip if no timesheet found
        payslips.push({
          employeeId: employee.id,
          normalHours: 0,
          overtimeHours: 0,
          gross: 0,
          tax: 0,
          super: 0,
          net: 0
        });
        continue;
      }

      const payslip = this.calculatePayslip(employee, employeeTimesheet);
      payslips.push(payslip);
    }

    const totals = this.calculateTotals(payslips);

    return {
      id: uuidv4(),
      periodStart,
      periodEnd,
      totals,
      payslips,
      createdAt: new Date()
    };
  }

  /**
   * Calculate payslip for a single employee
   */
  static calculatePayslip(employee: Employee, timesheet: Timesheet): Payslip {
    // Calculate hours
    const { normalHours, overtimeHours } = calculateHours(timesheet.entries);
    
    // Calculate gross pay
    const gross = calculateGrossPay(
      normalHours,
      overtimeHours,
      employee.baseHourlyRate,
      timesheet.allowances
    );

    // Calculate tax
    const tax = calculateTax(gross);

    // Calculate superannuation
    const super_ = calculateSuper(gross, employee.superRate);

    // Calculate net pay
    const net = calculateNet(gross, tax);

    return {
      employeeId: employee.id,
      normalHours,
      overtimeHours,
      gross,
      tax,
      super: super_,
      net
    };
  }

  /**
   * Calculate totals from all payslips
   */
  static calculateTotals(payslips: Payslip[]): PayrunTotals {
    const totals = payslips.reduce(
      (acc, payslip) => ({
        gross: acc.gross + payslip.gross,
        tax: acc.tax + payslip.tax,
        super: acc.super + payslip.super,
        net: acc.net + payslip.net
      }),
      { gross: 0, tax: 0, super: 0, net: 0 }
    );

    // Round totals
    return {
      gross: Math.round(totals.gross * 100) / 100,
      tax: Math.round(totals.tax * 100) / 100,
      super: Math.round(totals.super * 100) / 100,
      net: Math.round(totals.net * 100) / 100
    };
  }
}
