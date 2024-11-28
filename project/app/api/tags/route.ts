import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/lib/services/tag-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('TagAPI');

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();

    const tag = await TagService.createTag(data);
    
    logger.info(`Tag created by user ${user.id}`, { tagId: tag.id });
    
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    logger.error('Failed to create tag', error);
    
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
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') as 'product' | 'customer' | 'communication' | 'order' | undefined;

    const tags = await TagService.getTags({
      page,
      limit,
      search,
      type
    });
    
    logger.info(`Tags retrieved by user ${user.id}`);
    
    return NextResponse.json(tags);
  } catch (error) {
    logger.error('Failed to retrieve tags', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
