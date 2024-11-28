import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ProductDetailAPI');

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const user = await AuthService.authenticateRequest(req);
    
    const product = await ProductService.getProductById(params.id);
    
    logger.info(`Product retrieved by user ${user.id}`, { productId: params.id });
    
    return NextResponse.json(product);
  } catch (error) {
    logger.error(`Failed to retrieve product: ${params.id}`, error);
    
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
    if (!AuthService.hasPermission(user, ['admin', 'manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();

    const product = await ProductService.updateProduct(params.id, data);
    
    logger.info(`Product updated by user ${user.id}`, { productId: params.id });
    
    return NextResponse.json(product);
  } catch (error) {
    logger.error(`Failed to update product: ${params.id}`, error);
    
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

    const product = await ProductService.deleteProduct(params.id);
    
    logger.info(`Product deleted by user ${user.id}`, { productId: params.id });
    
    return NextResponse.json(product);
  } catch (error) {
    logger.error(`Failed to delete product: ${params.id}`, error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Product Tag Management Routes
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

    let product;
    if (action === 'add') {
      product = await ProductService.addProductTag(params.id, tagId);
    } else if (action === 'remove') {
      product = await ProductService.removeProductTag(params.id, tagId);
    } else {
      throw new AppError('Invalid action. Use "add" or "remove".', 400);
    }
    
    logger.info(`Product tag ${action}ed by user ${user.id}`, { 
      productId: params.id, 
      tagId, 
      action 
    });
    
    return NextResponse.json(product);
  } catch (error) {
    logger.error(`Failed to manage product tags: ${params.id}`, error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
