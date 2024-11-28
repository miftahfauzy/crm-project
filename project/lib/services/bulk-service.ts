import { PrismaClient } from '@prisma/client';
import { AppError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';

const prisma = new PrismaClient();
const logger = createLogger('BulkService');

export class BulkService {
  static async bulkCreateTags(tags: { name: string; customerId?: string }[]) {
    try {
      const createdTags = await prisma.tag.createMany({
        data: tags,
        skipDuplicates: true
      });

      logger.info('Bulk tags created', { count: createdTags.count });
      return createdTags;
    } catch (error) {
      logger.error('Failed to create bulk tags', error);
      throw new AppError('Failed to create tags', 400);
    }
  }

  static async bulkUpdateOrderStatus(
    orderIds: string[], 
    status: string, 
    userId: string
  ) {
    try {
      const updatedOrders = await prisma.order.updateMany({
        where: { 
          id: { in: orderIds },
          userId: userId  // Ensure user has permission
        },
        data: { status }
      });

      logger.info('Bulk order status updated', { 
        count: updatedOrders.count, 
        status 
      });

      return updatedOrders;
    } catch (error) {
      logger.error('Failed to update bulk order status', error);
      throw new AppError('Failed to update orders', 400);
    }
  }

  static async searchEntitiesByTag(
    tagName: string, 
    entityType: 'orders' | 'products' | 'customers'
  ) {
    try {
      const tag = await prisma.tag.findUnique({
        where: { name: tagName },
        include: {
          [entityType]: true
        }
      });

      if (!tag) {
        throw new AppError('Tag not found', 404);
      }

      logger.info(`Searched entities by tag`, { 
        tagName, 
        entityType, 
        count: tag[entityType].length 
      });

      return tag[entityType];
    } catch (error) {
      logger.error('Failed to search entities by tag', error);
      throw new AppError('Search failed', 400);
    }
  }
}
