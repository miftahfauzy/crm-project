import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`;
  })
);

export interface LoggerMeta {
  [key: string]: any;
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log') 
    })
  ]
});

export const createLogger = (context: string) => {
  return {
    info: (message: string, meta?: LoggerMeta) => 
      logger.info(`[${context}] ${message}`, meta),
    warn: (message: string, meta?: LoggerMeta) => 
      logger.warn(`[${context}] ${message}`, meta),
    error: (message: string, error?: Error) => 
      logger.error(`[${context}] ${message}`, error),
    debug: (message: string, meta?: LoggerMeta) => 
      logger.debug(`[${context}] ${message}`, meta)
  };
};

export default logger;
