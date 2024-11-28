import { NextRequest, NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/services/communication-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('CommunicationAPI');

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager', 'sales'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    data.userId = user.id; // Attach the user who created the communication

    const communication = await CommunicationService.createCommunication(data);
    
    logger.info(`Communication created by user ${user.id}`, { 
      communicationId: communication.id 
    });
    
    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    logger.error('Failed to create communication', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await AuthService.authenticateRequest(req);
    
    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    const customerId = searchParams.get('customerId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const type = searchParams.get('type') as 'email' | 'phone' | 'meeting' | 'chat' | 'sms' | undefined;
    const direction = searchParams.get('direction') as 'inbound' | 'outbound' | undefined;
    const status = searchParams.get('status') as 'pending' | 'completed' | 'failed' | undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const communications = await CommunicationService.getCommunications({
      page,
      limit,
      customerId,
      userId,
      type,
      direction,
      status,
      startDate,
      endDate
    });
    
    logger.info(`Communications retrieved by user ${user.id}`);
    
    return NextResponse.json(communications);
  } catch (error) {
    logger.error('Failed to retrieve communications', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await AuthService.authenticateRequest(req);
    
    const { customerId } = await req.json();

    const communicationSummary = await CommunicationService.getCustomerCommunicationSummary(customerId);
    
    logger.info(`Communication summary retrieved by user ${user.id}`, { customerId });
    
    return NextResponse.json(communicationSummary);
  } catch (error) {
    logger.error('Failed to retrieve communication summary', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
