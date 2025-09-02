import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './lib/logger.js';
import { authenticate, optionalAuthenticate } from './lib/auth.js';
import { DatabaseService } from './lib/database.js';
import { employeesRouter } from './routes/employees.js';
import { timesheetsRouter } from './routes/timesheets.js';
import { payrunsRouter } from './routes/payruns.js';
import { payslipsRouter } from './routes/payslips.js';

const app = express();
const port = process.env.PORT || 4000;
const db = new DatabaseService();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID middleware
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.headers['x-request-id']);
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqId = req.headers['x-request-id'] as string;
  
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    reqId
  });

  // Override res.end to log request completion
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);
    
    const duration = Date.now() - start;
    logger.logRequest(req.method, req.url, res.statusCode, duration, reqId);
  };
  
  next();
});

// Health check endpoint (no auth required)
app.get('/health', optionalAuthenticate, (req, res) => {
  logger.debug('Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes (require authentication)
app.use('/employees', authenticate, employeesRouter);
app.use('/timesheets', authenticate, timesheetsRouter);
app.use('/payruns', authenticate, payrunsRouter);
app.use('/payslips', authenticate, payslipsRouter);

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    reqId: req.headers['x-request-id'] as string
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  const reqId = req.headers['x-request-id'] as string;
  
  logger.logError(err, {
    method: req.method,
    url: req.url,
    reqId
  });

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(err.statusCode || 500).json({
    error: 'Internal Server Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await db.disconnect();
    logger.info('Database disconnected');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: (error as Error).message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    await db.connect();
    logger.info('Database connected');
    
    app.listen(port, () => {
      logger.info(`Payroo API server started`, {
        port,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  } catch (error) {
    logger.logError(error as Error);
    process.exit(1);
  }
}

startServer();

export default app;
