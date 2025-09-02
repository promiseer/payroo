import { DatabaseService } from '../lib/database.js';
import { logger } from '../lib/logger.js';

const db = new DatabaseService();

const employees = [
  {
    id: "e-alice",
    firstName: "Alice",
    lastName: "Chen",
    type: "hourly" as const,
    baseHourlyRate: 35.0,
    superRate: 0.115,
    bank: { bsb: "083-123", account: "12345678" }
  },
  {
    id: "e-bob",
    firstName: "Bob",
    lastName: "Singh",
    type: "hourly" as const,
    baseHourlyRate: 48.0,
    superRate: 0.115,
    bank: { bsb: "062-000", account: "98765432" }
  }
];

const timesheets = [
  {
    employeeId: "e-alice",
    periodStart: "2025-08-11",
    periodEnd: "2025-08-17",
    entries: [
      { date: "2025-08-11", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
      { date: "2025-08-12", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
      { date: "2025-08-13", start: "09:00", end: "17:30", unpaidBreakMins: 30 },
      { date: "2025-08-14", start: "09:00", end: "15:00", unpaidBreakMins: 30 },
      { date: "2025-08-15", start: "10:00", end: "18:00", unpaidBreakMins: 30 }
    ],
    allowances: 30.0
  },
  {
    employeeId: "e-bob",
    periodStart: "2025-08-11",
    periodEnd: "2025-08-17",
    entries: [
      { date: "2025-08-11", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-12", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-13", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-14", start: "08:00", end: "18:00", unpaidBreakMins: 60 },
      { date: "2025-08-15", start: "08:00", end: "18:00", unpaidBreakMins: 60 }
    ],
    allowances: 0.0
  }
];
    
async function seedDatabase() {
  try {
    await db.connect();
    logger.info('Connected to database for seeding');


    // Seed employees
    logger.info('Seeding employees...');
    for (const employee of employees) {
      await db.createEmployee(employee);
      logger.info(`Created employee: ${employee.firstName} ${employee.lastName}`);
    }

    // Seed timesheets
    logger.info('Seeding timesheets...');
    for (const timesheet of timesheets) {
      await db.createOrUpdateTimesheet(timesheet);
      logger.info(`Created timesheet for employee: ${timesheet.employeeId}`);
    }

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.logError(error as Error, { context: 'database seeding' });
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

seedDatabase();
