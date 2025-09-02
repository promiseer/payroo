import { PrismaClient } from '@prisma/client';
import { Employee, Timesheet, TimesheetEntry, Payrun } from '../domain/types.js';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // Employee operations
  async createEmployee(employee: Employee): Promise<Employee> {
    const created = await this.prisma.employee.create({
      data: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        type: employee.type,
        baseHourlyRate: employee.baseHourlyRate,
        superRate: employee.superRate,
        bankBsb: employee.bank?.bsb,
        bankAccount: employee.bank?.account
      }
    });

    return this.mapPrismaEmployeeToEmployee(created);
  }

  async getEmployees(): Promise<Employee[]> {
    const employees = await this.prisma.employee.findMany({
      orderBy: { firstName: 'asc' }
    });

    return employees.map(this.mapPrismaEmployeeToEmployee);
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findUnique({
      where: { id }
    });

    return employee ? this.mapPrismaEmployeeToEmployee(employee) : null;
  }

  async updateEmployee(employee: Employee): Promise<Employee> {
    const updated = await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        type: employee.type,
        baseHourlyRate: employee.baseHourlyRate,
        superRate: employee.superRate,
        bankBsb: employee.bank?.bsb,
        bankAccount: employee.bank?.account
      }
    });

    return this.mapPrismaEmployeeToEmployee(updated);
  }
  
//  delete employee
async deleteEmployee(id: string): Promise<void> {
    await this.prisma.employee.delete({
      where: { id }
    });
  }


  // Timesheet operations
  async createOrUpdateTimesheet(timesheet: Timesheet): Promise<Timesheet> {
    // First, try to find existing timesheet
    const existing = await this.prisma.timesheet.findUnique({
      where: {
        employeeId_periodStart_periodEnd: {
          employeeId: timesheet.employeeId,
          periodStart: timesheet.periodStart,
          periodEnd: timesheet.periodEnd
        }
      }
    });

    if (existing) {
      // Delete existing entries and create new ones
      await this.prisma.timesheetEntry.deleteMany({
        where: { timesheetId: existing.id }
      });

      const updated = await this.prisma.timesheet.update({
        where: { id: existing.id },
        data: {
          allowances: timesheet.allowances,
          entries: {
            create: timesheet.entries.map(entry => ({
              date: entry.date,
              start: entry.start,
              end: entry.end,
              unpaidBreakMins: entry.unpaidBreakMins
            }))
          }
        },
        include: { entries: true }
      });

      return this.mapPrismaTimesheetToTimesheet(updated);
    } else {
      // Create new timesheet
      const created = await this.prisma.timesheet.create({
        data: {
          employeeId: timesheet.employeeId,
          periodStart: timesheet.periodStart,
          periodEnd: timesheet.periodEnd,
          allowances: timesheet.allowances,
          entries: {
            create: timesheet.entries.map(entry => ({
              date: entry.date,
              start: entry.start,
              end: entry.end,
              unpaidBreakMins: entry.unpaidBreakMins
            }))
          }
        },
        include: { entries: true }
      });

      return this.mapPrismaTimesheetToTimesheet(created);
    }
  }

  async getTimesheets(employeeId?: string, periodStart?: string, periodEnd?: string): Promise<Timesheet[]> {
    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (periodStart) where.periodStart = { gte: periodStart };
    if (periodEnd) where.periodEnd = { lte: periodEnd };

    const timesheets = await this.prisma.timesheet.findMany({
      where,
      include: { entries: true },
      orderBy: { periodStart: 'desc' }
    });

    return timesheets.map(this.mapPrismaTimesheetToTimesheet);
  }

  async deleteTimesheet(employeeId: string, periodStart: string, periodEnd: string): Promise<void> {
    console.log('Deleting timesheet', { employeeId, periodStart, periodEnd });
    await this.prisma.timesheet.deleteMany({
      where: {
        employeeId,
        periodStart,
        periodEnd
      }
    });
  }

  // Payrun operations
  async createPayrun(payrun: Payrun): Promise<Payrun> {
    const created = await this.prisma.payrun.create({
      data: {
        id: payrun.id,
        periodStart: payrun.periodStart,
        periodEnd: payrun.periodEnd,
        totalGross: payrun.totals.gross,
        totalTax: payrun.totals.tax,
        totalSuper: payrun.totals.super,
        totalNet: payrun.totals.net,
        payslips: {
          create: payrun.payslips.map(payslip => ({
            employeeId: payslip.employeeId,
            normalHours: payslip.normalHours,
            overtimeHours: payslip.overtimeHours,
            gross: payslip.gross,
            tax: payslip.tax,
            super: payslip.super,
            net: payslip.net
          }))
        }
      },
      include: {
        payslips: {
          include: { employee: true }
        }
      }
    });

    return this.mapPrismaPayrunToPayrun(created);
  }

  async getPayruns(): Promise<Payrun[]> {
    const payruns = await this.prisma.payrun.findMany({
      include: {
        payslips: {
          include: { employee: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return payruns.map(this.mapPrismaPayrunToPayrun);
  }

  async getPayrun(id: string): Promise<Payrun | null> {
    const payrun = await this.prisma.payrun.findUnique({
      where: { id },
      include: {
        payslips: {
          include: { employee: true }
        }
      }
    });

    return payrun ? this.mapPrismaPayrunToPayrun(payrun) : null;
  }

  async getPayslip(employeeId: string, payrunId: string): Promise<any> {
    const payslip = await this.prisma.payslip.findUnique({
      where: {
        payrunId_employeeId: {
          payrunId,
          employeeId
        }
      },
      include: {
        employee: true,
        payrun: true
      }
    });

    return payslip;
  }

  // Private mapping methods
  private mapPrismaEmployeeToEmployee(prismaEmployee: any): Employee {
    return {
      id: prismaEmployee.id,
      firstName: prismaEmployee.firstName,
      lastName: prismaEmployee.lastName,
      type: prismaEmployee.type as 'hourly',
      baseHourlyRate: prismaEmployee.baseHourlyRate,
      superRate: prismaEmployee.superRate,
      bank: prismaEmployee.bankBsb && prismaEmployee.bankAccount ? {
        bsb: prismaEmployee.bankBsb,
        account: prismaEmployee.bankAccount
      } : undefined
    };
  }

  private mapPrismaTimesheetToTimesheet(prismaTimesheet: any): Timesheet {
    return {
      employeeId: prismaTimesheet.employeeId,
      periodStart: prismaTimesheet.periodStart,
      periodEnd: prismaTimesheet.periodEnd,
      allowances: prismaTimesheet.allowances,
      entries: prismaTimesheet.entries.map((entry: any) => ({
        date: entry.date,
        start: entry.start,
        end: entry.end,
        unpaidBreakMins: entry.unpaidBreakMins
      }))
    };
  }

  private mapPrismaPayrunToPayrun(prismaPayrun: any): Payrun {
    return {
      id: prismaPayrun.id,
      periodStart: prismaPayrun.periodStart,
      periodEnd: prismaPayrun.periodEnd,
      totals: {
        gross: prismaPayrun.totalGross,
        tax: prismaPayrun.totalTax,
        super: prismaPayrun.totalSuper,
        net: prismaPayrun.totalNet
      },
      payslips: prismaPayrun.payslips.map((payslip: any) => ({
        employeeId: payslip.employeeId,
        normalHours: payslip.normalHours,
        overtimeHours: payslip.overtimeHours,
        gross: payslip.gross,
        tax: payslip.tax,
        super: payslip.super,
        net: payslip.net
      })),
      createdAt: prismaPayrun.createdAt
    };
  }
}
