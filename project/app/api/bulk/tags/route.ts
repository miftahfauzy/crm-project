import { NextRequest, NextResponse } from 'next/server';
import { BulkService } from '@/lib/services/bulk-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('BulkTagsAPI');

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse request body
    const { tags } = await req.json();

    // Validate input
    if (!Array.isArray(tags) || tags.length === 0) {
      throw new AppError('Invalid tags input', 400);
    }

    // Perform bulk tag creation
    const result = await BulkService.bulkCreateTags(
      tags.map(tag => ({
        name: tag.name,
        customerId: tag.customerId // Optional
      }))
    );

    logger.info(`Bulk tags created by user ${user.id}`, { 
      tagCount: tags.length 
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logger.error('Bulk tag creation failed', error);
    
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

    // Get search params
    const { searchParams } = new URL(req.url);
    const tagName = searchParams.get('tagName');
    const entityType = searchParams.get('entityType') as 'orders' | 'products' | 'customers';

    // Validate input
    if (!tagName || !entityType) {
      throw new AppError('Missing tagName or entityType', 400);
    }

    // Search entities by tag
    const results = await BulkService.searchEntitiesByTag(tagName, entityType);

    logger.info(`Entities searched by tag by user ${user.id}`, { 
      tagName, 
      entityType, 
      resultCount: results.length 
    });

    return NextResponse.json(results);
  } catch (error) {
    logger.error('Tag entity search failed', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
