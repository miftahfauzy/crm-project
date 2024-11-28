import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const prisma = new PrismaClient();
const logger = createLogger('AdvancedQueryService');

export interface QueryFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: any;
}

export class AdvancedQueryService {
  static async complexOrderQuery(
    filters: QueryFilter[] = [],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    pageSize: number = 10
  ) {
    try {
      const whereConditions: Prisma.OrderWhereInput = filters.reduce((acc, filter) => {
        switch (filter.operator) {
          case 'equals':
            acc[filter.field] = { equals: filter.value };
            break;
          case 'contains':
            acc[filter.field] = { contains: filter.value };
            break;
          case 'gt':
            acc[filter.field] = { gt: filter.value };
            break;
          case 'lt':
            acc[filter.field] = { lt: filter.value };
            break;
          case 'in':
            acc[filter.field] = { in: filter.value };
            break;
        }
        return acc;
      }, {} as Prisma.OrderWhereInput);

      const orders = await prisma.order.findMany({
        where: whereConditions,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          customer: true,
          items: {
            include: { product: true }
          }
        }
      });

      const totalCount = await prisma.order.count({ where: whereConditions });

      logger.info('Complex order query executed', { 
        filters, 
        totalResults: orders.length, 
        totalCount 
      });

      return {
        orders,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          totalCount
        }
      };
    } catch (error) {
      logger.error('Failed to execute complex order query', error);
      throw new AppError('Query execution failed', 400);
    }
  }

  static async generateOrderReport(
    startDate: Date, 
    endDate: Date
  ) {
    try {
      const report = await prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: { id: true },
        _sum: { total: true }
      });

      logger.info('Order report generated', { 
        startDate, 
        endDate, 
        reportSections: report.length 
      });

      return report;
    } catch (error) {
      logger.error('Failed to generate order report', error);
      throw new AppError('Report generation failed', 400);
    }
  }
}
