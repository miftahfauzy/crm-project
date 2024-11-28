import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import logger from './logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string, 
    statusCode: number = 500, 
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = {
  handleError: (error: unknown) => {
    const appLogger = logger.createLogger('ErrorHandler');

    if (error instanceof ZodError) {
      appLogger.error('Validation Error', error);
      return NextResponse.json(
        { 
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          })) 
        }, 
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      appLogger.error(`Operational Error: ${error.message}`, error);
      return NextResponse.json(
        { message: error.message }, 
        { status: error.statusCode }
      );
    }

    if (error instanceof Error) {
      appLogger.error('Unexpected Error', error);
      return NextResponse.json(
        { message: 'Internal Server Error' }, 
        { status: 500 }
      );
    }

    appLogger.error('Unknown Error Type', error);
    return NextResponse.json(
      { message: 'An unknown error occurred' }, 
      { status: 500 }
    );
  },

  asyncHandler: (fn: (...args: any[]) => Promise<any>) => {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        return this.handleError(error);
      }
    };
  }
};
