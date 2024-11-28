import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/lib/services/tag-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger, LoggerMeta } from '@/lib/logger';

const logger = createLogger('TagDetailAPI');

type ErrorResponse = {
  message: string;
  status?: number;
}

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const user = await AuthService.authenticateRequest(req);
    
    const tag = await TagService.getTagById(params.id);
    
    logger.info(`Tag retrieved by user ${user.id}`, { tagId: params.id });
    
    return NextResponse.json(tag);
  } catch (error) {
    logger.error(`Failed to retrieve tag: ${params.id}`, error instanceof Error ? error : new Error(String(error)));
    
    if (error instanceof AppError) {
      return NextResponse.json<ErrorResponse>({ message: error.message, status: error.statusCode }, { status: error.statusCode });
    }
    
    return NextResponse.json<ErrorResponse>({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager'])) {
      return NextResponse.json<ErrorResponse>({ message: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();

    const tag = await TagService.updateTag(params.id, data);
    
    logger.info(`Tag updated by user ${user.id}`, { tagId: params.id });
    
    return NextResponse.json(tag);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to update tag: ${params.id}`, error instanceof Error ? error : new Error(errorMessage));
    
    if (error instanceof AppError) {
      return NextResponse.json<ErrorResponse>({ message: error.message, status: error.statusCode }, { status: error.statusCode });
    }
    
    return NextResponse.json<ErrorResponse>({ message: 'Internal Server Error' }, { status: 500 });
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
      return NextResponse.json<ErrorResponse>({ message: 'Unauthorized' }, { status: 403 });
    }

    const tag = await TagService.deleteTag(params.id);
    
    logger.info(`Tag deleted by user ${user.id}`, { tagId: params.id });
    
    return NextResponse.json(tag);
  } catch (error) {
    logger.error(`Failed to delete tag: ${params.id}`, error instanceof Error ? error : new Error(String(error)));
    
    if (error instanceof AppError) {
      return NextResponse.json<ErrorResponse>({ message: error.message, status: error.statusCode }, { status: error.statusCode });
    }
    
    return NextResponse.json<ErrorResponse>({ message: 'Internal Server Error' }, { status: 500 });
  }
}
