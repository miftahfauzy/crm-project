import { NextRequest, NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/services/communication-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('CommunicationDetailAPI');

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const user = await AuthService.authenticateRequest(req);
    
    const communication = await CommunicationService.getCommunicationById(params.id);
    
    logger.info(`Communication retrieved by user ${user.id}`, { communicationId: params.id });
    
    return NextResponse.json(communication);
  } catch (error) {
    logger.error(`Failed to retrieve communication: ${params.id}`, error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager', 'sales'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { status } = await req.json();

    const communication = await CommunicationService.updateCommunicationStatus(
      params.id, 
      status
    );
    
    logger.info(`Communication status updated by user ${user.id}`, { 
      communicationId: params.id, 
      status 
    });
    
    return NextResponse.json(communication);
  } catch (error) {
    logger.error(`Failed to update communication status: ${params.id}`, error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const communication = await CommunicationService.deleteCommunication(params.id);
    
    logger.info(`Communication deleted by user ${user.id}`, { communicationId: params.id });
    
    return NextResponse.json(communication);
  } catch (error) {
    logger.error(`Failed to delete communication: ${params.id}`, error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { tagId, action } = await req.json();

    let communication;
    if (action === 'add') {
      communication = await CommunicationService.addCommunicationTag(params.id, tagId);
    } else if (action === 'remove') {
      communication = await CommunicationService.removeCommunicationTag(params.id, tagId);
    } else {
      throw new AppError('Invalid action. Use "add" or "remove".', 400);
    }
    
    logger.info(`Communication tag ${action}ed by user ${user.id}`, { 
      communicationId: params.id, 
      tagId, 
      action 
    });
    
    return NextResponse.json(communication);
  } catch (error) {
    logger.error(`Failed to manage communication tags: ${params.id}`, error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
