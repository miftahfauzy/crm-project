import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/services/task-service';
import { authMiddleware } from '@/lib/middleware/auth-middleware';
import { z } from 'zod';

// Validation schema for productivity report
const productivityReportSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware.requireAuth(req);
    await authMiddleware.requireRole(['admin', 'manager'])(req);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate input
    const validatedParams = productivityReportSchema.parse(params);

    // Generate team productivity report
    const productivityReport = await TaskService.getTeamProductivity({
      startDate: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
      endDate: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined
    });

    return NextResponse.json({
      success: true,
      data: productivityReport
    }, { status: 200 });
  } catch (error) {
    console.error('Team Productivity Report Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate team productivity report'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 });
  }
}
