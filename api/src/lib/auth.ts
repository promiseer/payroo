import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

/**
 * Simple Bearer token authentication middleware
 * For the exercise, we accept any non-empty Bearer token
 * In production, this would validate JWT tokens or API keys
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: Missing or invalid Authorization header', {
      method: req.method,
      url: req.url,
      reqId: req.headers['x-request-id'] as string
    });
    
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token required'
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token || token.trim().length === 0) {
    logger.warn('Authentication failed: Empty token', {
      method: req.method,
      url: req.url,
      reqId: req.headers['x-request-id'] as string
    });
    
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Bearer token cannot be empty'
    });
    return;
  }

  // For the exercise, we accept any non-empty token
  // In production, validate the JWT token here
  req.user = {
    id: 'demo-user' // In production, extract from JWT
  };

  logger.debug('Authentication successful', {
    userId: req.user.id,
    method: req.method,
    url: req.url,
    reqId: req.headers['x-request-id'] as string
  });

  next();
}

/**
 * Optional authentication middleware for health check endpoint
 */
export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token && token.trim().length > 0) {
      req.user = {
        id: 'demo-user'
      };
    }
  }

  next();
}
