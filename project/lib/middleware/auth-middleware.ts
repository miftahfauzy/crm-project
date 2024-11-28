import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/auth-service';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';

const logger = createLogger('AuthMiddleware');

export const authMiddleware = {
  requireAuth: async (req: NextRequest) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        throw new AppError('No authorization token', 401);
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new AppError('Invalid token format', 401);
      }

      // Verify token
      const user = await AuthService.verifyToken(token);

      // Attach user to request
      req.user = user;

      return user;
    } catch (error) {
      logger.error('Authentication failed', error);
      
      if (error instanceof AppError) {
        return NextResponse.json(
          { message: error.message }, 
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        { message: 'Authentication failed' }, 
        { status: 401 }
      );
    }
  },

  requireRole: (allowedRoles: string[]) => {
    return async (req: NextRequest) => {
      try {
        const user = await authMiddleware.requireAuth(req);

        if (!allowedRoles.includes(user.role)) {
          throw new AppError('Insufficient permissions', 403);
        }

        return user;
      } catch (error) {
        logger.error('Role authorization failed', error);
        
        if (error instanceof AppError) {
          return NextResponse.json(
            { message: error.message }, 
            { status: error.statusCode }
          );
        }

        return NextResponse.json(
          { message: 'Authorization failed' }, 
          { status: 403 }
        );
      }
    };
  },

  // Optional: Rate limiting for authentication endpoints
  rateLimiter: (config: {
    maxRequests: number;
    windowMs: number;
  }) => {
    const requestLog: Record<string, { count: number; resetTime: number }> = {};

    return (req: NextRequest) => {
      const ip = req.ip || 'unknown';
      const now = Date.now();

      // Clean up expired entries
      Object.keys(requestLog).forEach(key => {
        if (requestLog[key].resetTime < now) {
          delete requestLog[key];
        }
      });

      // Check rate limit
      const entry = requestLog[ip] || { count: 0, resetTime: now + config.windowMs };
      
      if (entry.count >= config.maxRequests) {
        logger.warn(`Rate limit exceeded for IP: ${ip}`);
        return NextResponse.json(
          { message: 'Too many requests, please try again later' }, 
          { status: 429 }
        );
      }

      // Update request count
      requestLog[ip] = {
        count: entry.count + 1,
        resetTime: entry.resetTime
      };

      return null;
    };
  }
};
