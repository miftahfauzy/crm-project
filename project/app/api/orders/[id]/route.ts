import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order-service';
import { AuthService } from '@/lib/services/auth-service';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OrderDetailAPI');

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const user = await AuthService.authenticateRequest(req);
    
    const order = await OrderService.getOrderById(params.id);
    
    logger.info(`Order retrieved by user ${user.id}`, { orderId: params.id });
    
    return NextResponse.json(order);
  } catch (error) {
    logger.error(`Failed to retrieve order: ${params.id}`, error instanceof Error ? error : new Error(String(error)));
    
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

    const order = await OrderService.updateOrderStatus(params.id, status);
    
    logger.info(`Order status updated by user ${user.id}`, { 
      orderId: params.id, 
      status 
    });
    
    return NextResponse.json(order);
  } catch (error) {
    logger.error(`Failed to update order status: ${params.id}`, error instanceof Error ? error : new Error(String(error)));
    
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

    const order = await OrderService.deleteOrder(params.id);
    
    logger.info(`Order deleted by user ${user.id}`, { orderId: params.id });
    
    return NextResponse.json(order);
  } catch (error) {
    logger.error(`Failed to delete order: ${params.id}`, error instanceof Error ? error : new Error(String(error)));
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
