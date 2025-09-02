import { Router, Response } from 'express';
import { DatabaseService } from '../lib/database.js';
import { logger } from '../lib/logger.js';
import { AuthenticatedRequest } from '../lib/auth.js';

const router = Router();
const db = new DatabaseService();

/**
 * GET /payslips/:employeeId/:payrunId - Get a single employee payslip for a payrun
 */
router.get('/:employeeId/:payrunId', async (req: AuthenticatedRequest, res: Response) => {
  const reqId = req.headers?.['x-request-id'] as string;
  const employeeId = req.params?.employeeId;
  const payrunId = req.params?.payrunId;
  
  try {
    logger.info('Getting payslip', { 
      reqId, 
      userId: req.user?.id, 
      employeeId, 
      payrunId 
    });
    
    if (!employeeId || !payrunId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Both employeeId and payrunId are required'
      });
    }
    
    const payslip = await db.getPayslip(employeeId, payrunId);
    
    if (!payslip) {
      logger.warn('Payslip not found', { 
        reqId, 
        userId: req.user?.id, 
        employeeId, 
        payrunId 
      });
      return res.status(404).json({
        error: 'Not Found',
        message: 'Payslip not found'
      });
    }
    
    // Transform the response to match the Payslip schema
    const response = {
      employeeId: payslip.employeeId,
      normalHours: payslip.normalHours,
      overtimeHours: payslip.overtimeHours,
      gross: payslip.gross,
      tax: payslip.tax,
      super: payslip.super,
      net: payslip.net,
      // Additional context data
      employee: {
        firstName: payslip.employee.firstName,
        lastName: payslip.employee.lastName
      },
      payrun: {
        id: payslip.payrun.id,
        periodStart: payslip.payrun.periodStart,
        periodEnd: payslip.payrun.periodEnd
      }
    };
    
    logger.info('Retrieved payslip successfully', { 
      reqId, 
      employeeId, 
      payrunId,
      userId: req.user?.id 
    });
    
    res.json(response);
  } catch (error) {
    logger.logError(error as Error, { 
      reqId, 
      userId: req.user?.id, 
      employeeId, 
      payrunId 
    });
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve payslip'
    });
  }
});

export { router as payslipsRouter };
