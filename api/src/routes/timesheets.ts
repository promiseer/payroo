import { Router, Response } from 'express';
import { DatabaseService } from '../lib/database.js';
import { TimesheetSchema } from '../domain/validation.js';
import { logger } from '../lib/logger.js';
import { AuthenticatedRequest } from '../lib/auth.js';

const router = Router();
const db = new DatabaseService();

/**
 * GET /timesheets - Get timesheets with optional filtering
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  const userId = req.user?.id || 'unknown';
  
  try {
    logger.info('Getting timesheets', { 
      reqId, 
      userId,
      query: req.query 
    });
    
    const { employeeId, periodStart, periodEnd } = req.query;
    
    const timesheets = await db.getTimesheets(
      employeeId as string,
      periodStart as string,
      periodEnd as string
    );
    
    logger.info('Retrieved timesheets successfully', {
      reqId,
      userId,
      count: timesheets.length
    });
    
    res.json(timesheets);
  } catch (error) {
    logger.logError(error as Error, { 
      reqId, 
      userId,
      query: req.query 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve timesheets'
    });
  }
});

/**
 * POST /timesheets - Create or replace a timesheet for an employee+period
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  const userId = req.user?.id || 'unknown';
  
  try {
    logger.info('Creating/updating timesheet', { reqId, userId });
    
    // Validate request body
    const validationResult = TimesheetSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warn('Timesheet validation failed', {
        reqId,
        userId,
        errors: validationResult.error.errors
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid timesheet data',
        details: validationResult.error.errors
      });
    }

    const timesheetData = validationResult.data;

    // Validate that employee exists
    const employee = await db.getEmployee(timesheetData.employeeId);
    if (!employee) {
      logger.warn('Timesheet creation failed: Employee not found', {
        reqId,
        userId,
        employeeId: timesheetData.employeeId
      });
      
      return res.status(404).json({
        error: 'Not Found',
        message: `Employee with id ${timesheetData.employeeId} not found`
      });
    }

    // Validate date range
    const startDate = new Date(timesheetData.periodStart);
    const endDate = new Date(timesheetData.periodEnd);
    
    if (startDate > endDate) {
      logger.warn('Timesheet validation failed: Invalid date range', {
        reqId,
        userId,
        periodStart: timesheetData.periodStart,
        periodEnd: timesheetData.periodEnd
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Period start date must be before or equal to period end date'
      });
    }

    // Validate that all entry dates are within the period
    for (const entry of timesheetData.entries) {
      const entryDate = new Date(entry.date);
      if (entryDate < startDate || entryDate > endDate) {
        logger.warn('Timesheet validation failed: Entry date outside period', {
          reqId,
          userId,
          entryDate: entry.date,
          periodStart: timesheetData.periodStart,
          periodEnd: timesheetData.periodEnd
        });
        
        return res.status(400).json({
          error: 'Validation Error',
          message: `Entry date ${entry.date} is outside the period range`
        });
      }
    }

    const timesheet = await db.createOrUpdateTimesheet(timesheetData);
    
    logger.info('Timesheet created/updated successfully', {
      reqId,
      userId,
      employeeId: timesheet.employeeId,
      periodStart: timesheet.periodStart,
      periodEnd: timesheet.periodEnd,
      entriesCount: timesheet.entries.length
    });
    
    res.status(201).json(timesheet);
    return;
  } catch (error) {
    logger.logError(error as Error, { 
      reqId, 
      userId,
      body: req.body 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create/update timesheet'
    });
  }
});

/**
 * DELETE /timesheets/:employeeId/:periodStart/:periodEnd - Delete a timesheet
 */
router.delete('/:employeeId/:periodStart/:periodEnd', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  const userId = req.user?.id || 'unknown';
  
  try {
    const { employeeId, periodStart, periodEnd } = req.params;
    
    if (!employeeId || !periodStart || !periodEnd) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required parameters: employeeId, periodStart, periodEnd'
      });
    }
    
    logger.info('Deleting timesheet', { 
      reqId, 
      userId,
      employeeId,
      periodStart,
      periodEnd
    });
    
    await db.deleteTimesheet(employeeId, periodStart, periodEnd);
    
    logger.info('Timesheet deleted successfully', {
      reqId,
      userId,
      employeeId,
      periodStart,
      periodEnd
    });
    
    res.status(204).send();
  } catch (error) {
    logger.logError(error as Error, { 
      reqId, 
      userId,
      employeeId: req.params.employeeId,
      periodStart: req.params.periodStart,
      periodEnd: req.params.periodEnd
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete timesheet'
    });
  }
});

export { router as timesheetsRouter };
