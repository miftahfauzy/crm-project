import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth-service';
import { errorHandler } from '@/lib/error-handler';
import { authMiddleware } from '@/lib/middleware/auth-middleware';

export const POST = errorHandler.asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case 'register':
      const registrationResult = await AuthService.register(body);
      return NextResponse.json(registrationResult, { status: 201 });

    case 'login':
      const loginResult = await AuthService.login(body);
      return NextResponse.json(loginResult);

    case 'change-password':
      // Requires authentication
      const rateLimiter = authMiddleware.rateLimiter({ 
        maxRequests: 5, 
        windowMs: 15 * 60 * 1000 // 15 minutes
      });

      const rateCheck = rateLimiter(req);
      if (rateCheck) return rateCheck;

      await authMiddleware.requireAuth(req);
      const passwordChangeResult = await AuthService.changePassword(body);
      return NextResponse.json(passwordChangeResult);

    default:
      return NextResponse.json(
        { message: 'Invalid action' }, 
        { status: 400 }
      );
  }
});
