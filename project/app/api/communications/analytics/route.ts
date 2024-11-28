import { NextRequest, NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/services/communication-service';
import { authMiddleware } from '@/lib/middleware/auth-middleware';
import { z } from 'zod';

// Validation schema for communication analytics request
const communicationAnalyticsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  type: z.enum(['email', 'phone', 'meeting', 'chat', 'sms']).optional()
});

export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager']);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate request parameters
    const validatedParams = communicationAnalyticsSchema.parse({
      startDate: params.startDate,
      endDate: params.endDate,
      userId: params.userId,
      type: params.type
    });

    // Generate communication report
    const communicationReport = await CommunicationService.generateCommunicationReport({
      startDate: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
      endDate: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined,
      userId: validatedParams.userId,
      type: validatedParams.type
    });

    return NextResponse.json({
      success: true,
      data: communicationReport
    }, { status: 200 });
  } catch (error) {
    console.error('Communication Analytics Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve communication analytics'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager', 'sales']);

    // Parse request body
    const body = await req.json();

    // Validate follow-up scheduling request
    const followUpSchema = z.object({
      originalCommunicationId: z.string(),
      scheduledAt: z.string().datetime(),
      type: z.enum(['email', 'phone', 'meeting', 'chat', 'sms']),
      content: z.string(),
      userId: z.string()
    });

    const validatedData = followUpSchema.parse(body);

    // Schedule follow-up communication
    const followUpCommunication = await CommunicationService.scheduleFollowUp({
      originalCommunicationId: validatedData.originalCommunicationId,
      scheduledAt: new Date(validatedData.scheduledAt),
      type: validatedData.type,
      content: validatedData.content,
      userId: validatedData.userId
    });

    return NextResponse.json({
      success: true,
      data: followUpCommunication
    }, { status: 201 });
  } catch (error) {
    console.error('Communication Follow-up Scheduling Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to schedule follow-up communication'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager']);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate request parameters
    const effectivenessSchema = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      type: z.enum(['email', 'phone', 'meeting', 'chat', 'sms']).optional()
    });

    const validatedParams = effectivenessSchema.parse({
      startDate: params.startDate,
      endDate: params.endDate,
      type: params.type
    });

    // Analyze communication effectiveness
    const effectivenessReport = await CommunicationService.analyzeCommunicationEffectiveness({
      startDate: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
      endDate: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined,
      type: validatedParams.type
    });

    return NextResponse.json({
      success: true,
      data: effectivenessReport
    }, { status: 200 });
  } catch (error) {
    console.error('Communication Effectiveness Analysis Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to analyze communication effectiveness'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 });
  }
}
