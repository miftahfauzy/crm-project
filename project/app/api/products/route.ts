import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ProductAPI');

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    data.userId = user.id; // Attach the user who created the product

    const product = await ProductService.createProduct(data);
    
    logger.info(`Product created by user ${user.id}`, { productId: product.id });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logger.error('Failed to create product', error);
    
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
    const status = searchParams.get('status') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;

    const products = await ProductService.getProducts({
      page,
      limit,
      search,
      status,
      minPrice,
      maxPrice
    });
    
    logger.info(`Products retrieved by user ${user.id}`);
    
    return NextResponse.json(products);
  } catch (error) {
    logger.error('Failed to retrieve products', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
