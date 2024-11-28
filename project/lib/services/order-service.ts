import { db } from '../prisma';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';
import { orderSchema } from '../validation';

export class OrderService {
  private static logger = createLogger('OrderService');

  static async createOrder(data: {
    customerId: string;
    userId: string;
    total: number;
    status?: string;
    items: {
      productId: string;
      quantity: number;
      price: number;
    }[];
  }) {
    try {
      const validatedData = orderSchema.parse(data);

      // Verify customer exists
      const customer = await db.customer.findUnique({
        where: { id: validatedData.customerId }
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      // Verify all products exist
      const productIds = validatedData.items.map(item => item.productId);
      const products = await db.product.findMany({
        where: { id: { in: productIds } }
      });

      if (products.length !== productIds.length) {
        throw new AppError('One or more products not found', 404);
      }

      const order = await db.order.create({
        data: {
          customerId: validatedData.customerId,
          userId: validatedData.userId,
          total: validatedData.total,
          status: validatedData.status || 'pending',
          items: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      this.logger.info(`Order created: ${order.id}`, { 
        customerId: order.customerId, 
        total: order.total 
      });

      return order;
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw error;
    }
  }

  static async getOrders(options?: {
    page?: number;
    limit?: number;
    customerId?: string;
    userId?: string;
    status?: string;
    minTotal?: number;
    maxTotal?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const customerId = options?.customerId;
      const userId = options?.userId;
      const status = options?.status;
      const minTotal = options?.minTotal;
      const maxTotal = options?.maxTotal;
      const startDate = options?.startDate;
      const endDate = options?.endDate;

      const skip = (page - 1) * limit;

      const where = {
        AND: [
          customerId ? { customerId } : {},
          userId ? { userId } : {},
          status ? { status } : {},
          minTotal !== undefined ? { total: { gte: minTotal } } : {},
          maxTotal !== undefined ? { total: { lte: maxTotal } } : {},
          startDate ? { createdAt: { gte: startDate } } : {},
          endDate ? { createdAt: { lte: endDate } } : {}
        ]
      };

      const [orders, total] = await Promise.all([
        db.order.findMany({
          where,
          skip,
          take: limit,
          include: {
            customer: true,
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        db.order.count({ where })
      ]);

      this.logger.info(`Retrieved orders: page ${page}, total ${total}`);

      return {
        orders,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error('Failed to retrieve orders', error);
      throw new AppError('Failed to retrieve orders', 500);
    }
  }

  static async getOrderById(id: string) {
    try {
      const order = await db.order.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      this.logger.info(`Retrieved order: ${id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to retrieve order: ${id}`, error);
      throw error;
    }
  }

  static async updateOrderStatus(id: string, status: string) {
    try {
      const validStatus = ['pending', 'processing', 'completed', 'cancelled'];
      
      if (!validStatus.includes(status)) {
        throw new AppError('Invalid order status', 400);
      }

      const order = await db.order.update({
        where: { id },
        data: { status },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      this.logger.info(`Updated order status: ${id}`, { status });
      return order;
    } catch (error) {
      this.logger.error(`Failed to update order status: ${id}`, error);
      throw error;
    }
  }

  static async deleteOrder(id: string) {
    try {
      // Check order status before deletion
      const existingOrder = await db.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new AppError('Order not found', 404);
      }

      if (existingOrder.status !== 'cancelled') {
        throw new AppError('Only cancelled orders can be deleted', 400);
      }

      const order = await db.order.delete({
        where: { id }
      });

      this.logger.info(`Deleted order: ${id}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to delete order: ${id}`, error);
      throw new AppError('Failed to delete order', 500);
    }
  }

  static async calculateCustomerTotalPurchases(customerId: string) {
    try {
      const result = await db.order.aggregate({
        where: { 
          customerId, 
          status: 'completed' 
        },
        _sum: { total: true },
        _count: { id: true }
      });

      this.logger.info(`Calculated total purchases for customer: ${customerId}`);

      return {
        totalPurchases: result._sum.total || 0,
        totalOrders: result._count.id || 0
      };
    } catch (error) {
      this.logger.error(`Failed to calculate customer purchases: ${customerId}`, error);
      throw new AppError('Failed to calculate purchases', 500);
    }
  }
}
