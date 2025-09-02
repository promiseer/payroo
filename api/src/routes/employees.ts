import { Router, Request, Response } from 'express';
import { DatabaseService } from '../lib/database.js';
import { EmployeeSchema } from '../domain/validation.js';
import { logger } from '../lib/logger.js';
import { AuthenticatedRequest } from '../lib/auth.js';

const router = Router();
const db = new DatabaseService();

/**
 * GET /employees - List all employees
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  
  try {
    logger.info('Getting all employees', { reqId, userId: req.user?.id });
    
    const employees = await db.getEmployees();
    
    logger.info('Retrieved employees successfully', { 
      reqId, 
      count: employees.length,
      userId: req.user?.id 
    });
    
    res.json(employees);
  } catch (error) {
    logger.logError(error as Error, { reqId, userId: req.user?.id });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve employees'
    });
  }
});

/**
 * POST /employees - Create or upsert an employee
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  
  try {
    logger.info('Creating/updating employee', { reqId, userId: req.user?.id });
    
    // Validate request body
    const validationResult = EmployeeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      logger.warn('Employee validation failed', {
        reqId,
        userId: req.user?.id,
        errors: validationResult.error.errors
      });
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid employee data',
        details: validationResult.error.errors
      });
    }

    const employeeData = validationResult.data;

    // Check if employee exists
    const existingEmployee = await db.getEmployee(employeeData.id);
    
    let employee;
    if (existingEmployee) {
      // Update existing employee
      employee = await db.updateEmployee(employeeData);
      logger.info('Employee updated successfully', {
        reqId,
        userId: req.user?.id,
        employeeId: employee.id
      });
    } else {
      // Create new employee
      employee = await db.createEmployee(employeeData);
      logger.info('Employee created successfully', {
        reqId,
        userId: req.user?.id,
        employeeId: employee.id
      });
    }
    
    res.status(201).json(employee);
  } catch (error) {
    logger.logError(error as Error, { 
      reqId, 
      userId: req.user?.id,
      body: req.body 
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create/update employee'
    });
  }
});

export { router as employeesRouter };
