import winston from 'winston';

export interface LogContext {
  agent?: string;
  requestId?: string;
  userId?: string;
  operation?: string;
  [key: string]: any;
}

export class Logger {
  private logger: winston.Logger;
  private context: LogContext = {};

  constructor(agentName: string, level: string = 'info') {
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { agent: agentName },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: `logs/${agentName}-error.log`,
          level: 'error',
        }),
        new winston.transports.File({
          filename: `logs/${agentName}-combined.log`,
        }),
      ],
    });

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Set context for subsequent log messages
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Log info message
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, { ...this.context, ...meta });
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, { ...this.context, ...meta });
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, meta?: any): void {
    this.logger.error(message, {
      ...this.context,
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    });
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, { ...this.context, ...meta });
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, duration: number, statusCode: number): void {
    this.info('API Request', {
      method,
      path,
      duration: `${duration}ms`,
      statusCode,
    });
  }

  /**
   * Log agent operation start
   */
  logOperationStart(operation: string, params?: any): void {
    this.info('Operation Started', {
      operation,
      params,
    });
  }

  /**
   * Log agent operation completion
   */
  logOperationComplete(operation: string, result?: any, duration?: number): void {
    this.info('Operation Completed', {
      operation,
      result,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Log agent operation error
   */
  logOperationError(operation: string, error: Error, params?: any): void {
    this.error('Operation Failed', error, {
      operation,
      params,
    });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(operation: string, table: string, duration: number, rowsAffected?: number): void {
    this.debug('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      rowsAffected,
    });
  }

  /**
   * Log external API call
   */
  logExternalApiCall(service: string, endpoint: string, duration: number, statusCode: number): void {
    this.debug('External API Call', {
      service,
      endpoint,
      duration: `${duration}ms`,
      statusCode,
    });
  }

  /**
   * Log vector operation
   */
  logVectorOperation(operation: string, table: string, vectorSize: number, duration: number): void {
    this.debug('Vector Operation', {
      operation,
      table,
      vectorSize,
      duration: `${duration}ms`,
    });
  }
}

/**
 * Create logger instance for an agent
 */
export function createLogger(agentName: string, level?: string): Logger {
  return new Logger(agentName, level);
}

/**
 * Middleware for Express to log requests
 */
export function requestLogger(logger: Logger) {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.logRequest(req.method, req.path, duration, res.statusCode);
    });

    next();
  };
}