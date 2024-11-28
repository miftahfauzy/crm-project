import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OrderAPI');

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await AuthService.authenticateRequest(req);
    if (!AuthService.hasPermission(user, ['admin', 'manager', 'sales'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    data.userId = user.id; // Attach the user who created the order

    const order = await OrderService.createOrder(data);
    
    logger.info(`Order created by user ${user.id}`, { orderId: order.id });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    logger.error('Failed to create order', error);
    
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
    const status = searchParams.get('status') || undefined;
    const minTotal = searchParams.get('minTotal') ? Number(searchParams.get('minTotal')) : undefined;
    const maxTotal = searchParams.get('maxTotal') ? Number(searchParams.get('maxTotal')) : undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const orders = await OrderService.getOrders({
      page,
      limit,
      customerId,
      userId,
      status,
      minTotal,
      maxTotal,
      startDate,
      endDate
    });
    
    logger.info(`Orders retrieved by user ${user.id}`);
    
    return NextResponse.json(orders);
  } catch (error) {
    logger.error('Failed to retrieve orders', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Endpoint to calculate total customer purchases
export async function PUT(req: NextRequest) {
  try {
    // Authenticate the request
    const user = await AuthService.authenticateRequest(req);
    
    const { customerId } = await req.json();

    const customerPurchases = await OrderService.calculateCustomerTotalPurchases(customerId);
    
    logger.info(`Customer total purchases calculated by user ${user.id}`, { customerId });
    
    return NextResponse.json(customerPurchases);
  } catch (error) {
    logger.error('Failed to calculate customer total purchases', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
