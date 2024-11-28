import { db } from '../prisma';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';
import { tagSchema } from '../validation';

export class TagService {
  private static logger = createLogger('TagService');

  static async createTag(data: {
    name: string;
    color?: string;
    description?: string;
    type?: 'product' | 'customer' | 'communication' | 'order';
  }) {
    try {
      const validatedData = tagSchema.parse(data);

      const tag = await db.tag.create({
        data: validatedData
      });

      this.logger.info(`Tag created: ${tag.id}`, { name: tag.name });
      return tag;
    } catch (error) {
      this.logger.error('Failed to create tag', error);
      throw error;
    }
  }

  static async getTags(options?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'product' | 'customer' | 'communication' | 'order';
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const search = options?.search || '';
      const type = options?.type;

      const skip = (page - 1) * limit;

      const where = {
        AND: [
          search ? { 
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          type ? { type } : {}
        ]
      };

      const [tags, total] = await Promise.all([
        db.tag.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        db.tag.count({ where })
      ]);

      this.logger.info(`Retrieved tags: page ${page}, total ${total}`);

      return {
        tags,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error('Failed to retrieve tags', error);
      throw new AppError('Failed to retrieve tags', 500);
    }
  }

  static async getTagById(id: string) {
    try {
      const tag = await db.tag.findUnique({
        where: { id },
        include: {
          products: true,
          customers: true,
          communications: true,
          orders: true
        }
      });

      if (!tag) {
        throw new AppError('Tag not found', 404);
      }

      this.logger.info(`Retrieved tag: ${id}`);
      return tag;
    } catch (error) {
      this.logger.error(`Failed to retrieve tag: ${id}`, error);
      throw error;
    }
  }

  static async updateTag(id: string, data: {
    name?: string;
    color?: string;
    description?: string;
    type?: 'product' | 'customer' | 'communication' | 'order';
  }) {
    try {
      const validatedData = tagSchema.partial().parse(data);

      const tag = await db.tag.update({
        where: { id },
        data: validatedData
      });

      this.logger.info(`Updated tag: ${id}`);
      return tag;
    } catch (error) {
      this.logger.error(`Failed to update tag: ${id}`, error);
      throw error;
    }
  }

  static async deleteTag(id: string) {
    try {
      // Check if tag is used in any entities
      const [productCount, customerCount, communicationCount, orderCount] = await Promise.all([
        db.product.count({ where: { tags: { some: { id } } } }),
        db.customer.count({ where: { tags: { some: { id } } } }),
        db.communication.count({ where: { tags: { some: { id } } } }),
        db.order.count({ where: { tags: { some: { id } } } })
      ]);

      if (productCount + customerCount + communicationCount + orderCount > 0) {
        throw new AppError('Cannot delete tag that is in use', 400);
      }

      const tag = await db.tag.delete({
        where: { id }
      });

      this.logger.info(`Deleted tag: ${id}`);
      return tag;
    } catch (error) {
      this.logger.error(`Failed to delete tag: ${id}`, error);
      throw new AppError('Failed to delete tag', 500);
    }
  }
}
