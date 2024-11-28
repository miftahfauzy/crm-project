import bcrypt from 'bcryptjs';
import { db } from '../prisma';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback_secret_dev_only';

const AuthSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be less than 64 characters')
});

export class AuthService {
  private static logger = createLogger('AuthService');

  static async register(data: {
    email: string;
    password: string;
    name?: string;
  }) {
    try {
      const { email, password, name } = AuthSchema.parse(data);

      // Check if user already exists
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError('User already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          status: 'active'
        },
        select: {
          id: true,
          email: true,
          name: true,
          status: true
        }
      });

      this.logger.info(`User registered: ${user.id}`, { email: user.email });
      return user;
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw error;
    }
  }

  static async login(credentials: {
    email: string;
    password: string;
  }) {
    try {
      const { email, password } = AuthSchema.parse(credentials);

      // Find user
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check user status
      if (user.status !== 'active') {
        throw new AppError('Account is not active', 403);
      }

      // Generate JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      this.logger.info(`User logged in: ${user.id}`, { email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { 
        userId: string, 
        email: string, 
        role: string 
      };

      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true
        }
      });

      if (!user || user.status !== 'active') {
        throw new AppError('Invalid token', 401);
      }

      return user;
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw new AppError('Invalid or expired token', 401);
    }
  }

  static async changePassword(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    try {
      const { userId, currentPassword, newPassword } = data;

      // Validate new password
      z.string()
        .min(8, 'New password must be at least 8 characters')
        .max(64, 'New password must be less than 64 characters')
        .parse(newPassword);

      // Find user
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      this.logger.info(`Password changed for user: ${userId}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      this.logger.error('Password change failed', error);
      throw error;
    }
  }

  static hasPermission(user: { role: string }, allowedRoles: string[]): boolean {
    return allowedRoles.includes(user.role);
  }

  static async authenticateRequest(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new AppError('No authorization token', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Invalid token format', 401);
    }

    return this.verifyToken(token);
  }
}
