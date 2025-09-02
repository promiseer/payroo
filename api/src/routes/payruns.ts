import { Router, Response } from 'express';
import { DatabaseService } from '../lib/database.js';
import { PayrunRequestSchema } from '../domain/validation.js';
import { PayrunService } from '../domain/payrunService.js';
import { logger } from '../lib/logger.js';
import { AuthenticatedRequest } from '../lib/auth.js';

const router = Router();
const db = new DatabaseService();

/**
 * POST /payruns - Generate a payrun for a period
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  
  try {
    logger.info('Generating payrun', { reqId, userId: req.user?.id });
    
    // Validate request body
    const validationResult = PayrunRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warn('Payrun request validation failed', {
        reqId,
        userId: req.user?.id,
        errors: validationResult.error.errors
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid payrun request data',
        details: validationResult.error.errors
      });
    }

    const { periodStart, periodEnd, employeeIds } = validationResult.data;

    // Validate date range
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    
    if (startDate > endDate) {
      logger.warn('Payrun validation failed: Invalid date range', {
        reqId,
        userId: req.user?.id,
        periodStart,
        periodEnd
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Period start date must be before or equal to period end date'
      });
    }

    // Get employees (all or filtered by IDs)
    let employees = await db.getEmployees();
    
    if (employeeIds && employeeIds.length > 0) {
      employees = employees.filter(emp => employeeIds.includes(emp.id));
      
      // Check if all requested employee IDs exist
      const foundIds = employees.map(emp => emp.id);
      const missingIds = employeeIds.filter(id => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        logger.warn('Payrun generation failed: Some employees not found', {
          reqId,
          userId: req.user?.id,
          missingIds
        });
        
        return res.status(404).json({
          error: 'Not Found',
          message: `Employees not found: ${missingIds.join(', ')}`
        });
      }
    }

    if (employees.length === 0) {
      logger.warn('Payrun generation failed: No employees found', {
        reqId,
        userId: req.user?.id
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No employees found for payrun generation'
      });
    }

    // Get timesheets for the period
    const timesheets = await db.getTimesheets(undefined, periodStart, periodEnd);
    
    // Generate the payrun
    const payrun = PayrunService.generatePayrun(
      periodStart,
      periodEnd,
      employees,
      timesheets
    );

    // Save the payrun to database
    const savedPayrun = await db.createPayrun(payrun);
    
    logger.info('Payrun generated successfully', {
      reqId,
      userId: req.user?.id,
      payrunId: savedPayrun.id,
      employeesCount: employees.length,
      totalGross: savedPayrun.totals.gross,
      totalNet: savedPayrun.totals.net
    });
    
    res.status(201).json(savedPayrun);
  } catch (error) {
    logger.logError(error as Error, { 
      reqId, 
      userId: req.user?.id,
      body: req.body 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate payrun'
    });
  }
});

/**
 * GET /payruns - List all payruns
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  
  try {
    logger.info('Getting all payruns', { reqId, userId: req.user?.id });
    
    const payruns = await db.getPayruns();
    
    logger.info('Retrieved payruns successfully', { 
      reqId, 
      count: payruns.length,
      userId: req.user?.id 
    });
    
    res.json(payruns);
  } catch (error) {
    logger.logError(error as Error, { reqId, userId: req.user?.id });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve payruns'
    });
  }
});

/**
 * GET /payruns/:id - Get a payrun by ID
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  const payrunId = req.params?.id;
  
  try {
    logger.info('Getting payrun by ID', { reqId, userId: req.user?.id, payrunId });
    
    if (!payrunId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Payrun ID is required'
      });
    }
    
    const payrun = await db.getPayrun(payrunId);
    
    if (!payrun) {
      logger.warn('Payrun not found', { reqId, userId: req.user?.id, payrunId });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Payrun not found'
      });
    }
    
    logger.info('Retrieved payrun successfully', { 
      reqId, 
      payrunId,
      userId: req.user?.id 
    });
    
    res.json(payrun);
  } catch (error) {
    logger.logError(error as Error, { reqId, userId: req.user?.id, payrunId });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve payrun'
    });
  }
});

export { router as payrunsRouter };
