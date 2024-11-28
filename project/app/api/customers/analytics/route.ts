import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer-service';
import { authMiddleware } from '@/lib/middleware/auth-middleware';

export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager']);

    // Generate customer segments and analytics
    const segments = await CustomerService.getCustomerSegments();

    return NextResponse.json({
      success: true,
      data: segments
    }, { status: 200 });
  } catch (error) {
    console.error('Customer Analytics Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve customer analytics'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager']);

    // Parse request body
    const body = await req.json();
    const { customerId, tagName } = body;

    if (!customerId || !tagName) {
      return NextResponse.json({
        success: false,
        message: 'Customer ID and tag name are required'
      }, { status: 400 });
    }

    // Add tag to customer
    const updatedCustomer = await CustomerService.addCustomerTag(customerId, tagName);

    return NextResponse.json({
      success: true,
      data: updatedCustomer
    }, { status: 200 });
  } catch (error) {
    console.error('Add Customer Tag Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add customer tag'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 });
  }
}
