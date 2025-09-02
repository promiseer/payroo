export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  reqId?: string;
  userId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context
    };
    return JSON.stringify(logEntry);
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatLog('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatLog('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatLog('error', message, context));
    }
  }

  // Request logging middleware helper
  logRequest(method: string, url: string, statusCode: number, duration: number, reqId?: string): void {
    this.info('Request completed', {
      method,
      url,
      statusCode,
      duration,
      reqId
    });
  }

  logError(error: Error, context?: LogContext): void {
    this.error(error.message, {
      ...context,
      error: error.stack,
      errorName: error.name
    });
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
