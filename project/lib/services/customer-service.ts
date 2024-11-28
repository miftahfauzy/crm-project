import { db } from '../prisma';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';
import { customerSchema } from '../validation';

export class CustomerService {
  private static logger = createLogger('CustomerService');

  static async createCustomer(data: {
    email: string;
    name: string;
    phone?: string;
    company?: string;
  }) {
    try {
      const validatedData = customerSchema.parse(data);

      const existingCustomer = await db.customer.findUnique({
        where: { email: validatedData.email }
      });

      if (existingCustomer) {
        throw new AppError('Customer with this email already exists', 409);
      }

      const customer = await db.customer.create({
        data: {
          ...validatedData,
          status: 'active',
          type: 'regular',
        }
      });

      this.logger.info(`Customer created: ${customer.id}`, { email: customer.email });
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer', error);
      throw error;
    }
  }

  static async getCustomers(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const search = options?.search || '';

      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [customers, total] = await Promise.all([
        db.customer.findMany({
          where,
          skip,
          take: limit,
          include: {
            tags: true,
            _count: { select: { orders: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        db.customer.count({ where })
      ]);

      this.logger.info(`Retrieved customers: page ${page}, total ${total}`);

      return {
        customers: customers.map(customer => ({
          ...customer,
          totalOrders: customer._count.orders
        })),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error('Failed to retrieve customers', error);
      throw new AppError('Failed to retrieve customers', 500);
    }
  }

  static async getCustomerById(id: string) {
    try {
      const customer = await db.customer.findUnique({
        where: { id },
        include: {
          orders: true,
          tags: true,
          communications: true,
        }
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      this.logger.info(`Retrieved customer: ${id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to retrieve customer: ${id}`, error);
      throw error;
    }
  }

  static async updateCustomer(id: string, data: {
    name?: string;
    phone?: string;
    company?: string;
    status?: string;
    type?: string;
  }) {
    try {
      const validatedData = customerSchema.partial().parse(data);

      const customer = await db.customer.update({
        where: { id },
        data: validatedData,
      });

      this.logger.info(`Updated customer: ${id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to update customer: ${id}`, error);
      throw error;
    }
  }

  static async deleteCustomer(id: string) {
    try {
      const customer = await db.customer.delete({
        where: { id }
      });

      this.logger.info(`Deleted customer: ${id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to delete customer: ${id}`, error);
      throw new AppError('Failed to delete customer', 500);
    }
  }

  static async getCustomerSegments() {
    try {
      const segments = await db.customer.groupBy({
        by: ['type', 'status'],
        _count: { 
          id: true 
        },
        _sum: { 
          orders: { 
            select: { total: true } 
          }
        }
      });

      const customerLifetimeValue = await db.customer.findMany({
        select: {
          id: true,
          name: true,
          _sum: { 
            orders: { 
              select: { total: true } 
            }
          }
        },
        orderBy: {
          _sum: { 
            orders: { 
              total: 'desc' 
            }
          }
        },
        take: 10
      });

      this.logger.info('Generated customer segments and lifetime value report');

      return {
        segmentBreakdown: segments,
        topCustomers: customerLifetimeValue
      };
    } catch (error) {
      this.logger.error('Failed to generate customer segments', error);
      throw new AppError('Failed to generate customer segments', 500);
    }
  }

  static async addCustomerTag(customerId: string, tagName: string) {
    try {
      // First, ensure the tag exists or create it
      const tag = await db.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });

      // Then, connect the tag to the customer
      const updatedCustomer = await db.customer.update({
        where: { id: customerId },
        data: {
          tags: {
            connect: { id: tag.id }
          }
        },
        include: { tags: true }
      });

      this.logger.info(`Added tag ${tagName} to customer ${customerId}`, { 
        customerId, 
        tagName 
      });

      return updatedCustomer;
    } catch (error) {
      this.logger.error('Failed to add customer tag', error);
      throw new AppError('Failed to add customer tag', 400);
    }
  }

  static async getCustomerInteractionHistory(customerId: string) {
    try {
      const interactions = await db.customer.findUnique({
        where: { id: customerId },
        include: {
          communications: {
            orderBy: { createdAt: 'desc' },
            take: 50
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
              items: {
                include: { product: true }
              }
            }
          }
        }
      });

      if (!interactions) {
        throw new AppError('Customer not found', 404);
      }

      this.logger.info(`Retrieved interaction history for customer ${customerId}`);

      return {
        communications: interactions.communications,
        recentOrders: interactions.orders
      };
    } catch (error) {
      this.logger.error('Failed to retrieve customer interaction history', error);
      throw new AppError('Failed to retrieve interaction history', 500);
    }
  }
}
