import { db } from '../prisma';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';
import { productSchema } from '../validation';

export class ProductService {
  private static logger = createLogger('ProductService');

  static async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    status?: string;
    tags?: string[];
  }) {
    try {
      const validatedData = productSchema.parse(data);

      const product = await db.product.create({
        data: {
          ...validatedData,
          tags: validatedData.tags ? {
            connect: validatedData.tags.map(tagId => ({ id: tagId }))
          } : undefined
        },
        include: {
          tags: true
        }
      });

      this.logger.info(`Product created: ${product.id}`, { name: product.name });
      return product;
    } catch (error) {
      this.logger.error('Failed to create product', error);
      throw error;
    }
  }

  static async getProducts(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const search = options?.search || '';
      const status = options?.status;
      const minPrice = options?.minPrice;
      const maxPrice = options?.maxPrice;

      const skip = (page - 1) * limit;

      const where = {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          status ? { status } : {},
          minPrice !== undefined ? { price: { gte: minPrice } } : {},
          maxPrice !== undefined ? { price: { lte: maxPrice } } : {}
        ]
      };

      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          skip,
          take: limit,
          include: {
            tags: true,
            _count: { select: { orderItems: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        db.product.count({ where })
      ]);

      this.logger.info(`Retrieved products: page ${page}, total ${total}`);

      return {
        products: products.map(product => ({
          ...product,
          totalOrders: product._count.orderItems
        })),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error('Failed to retrieve products', error);
      throw new AppError('Failed to retrieve products', 500);
    }
  }

  static async getProductById(id: string) {
    try {
      const product = await db.product.findUnique({
        where: { id },
        include: {
          tags: true,
          orderItems: {
            include: {
              order: {
                include: {
                  customer: true
                }
              }
            }
          }
        }
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      this.logger.info(`Retrieved product: ${id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to retrieve product: ${id}`, error);
      throw error;
    }
  }

  static async updateProduct(id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    status?: string;
    tags?: string[];
  }) {
    try {
      const validatedData = productSchema.partial().parse(data);

      const product = await db.product.update({
        where: { id },
        data: {
          ...validatedData,
          tags: validatedData.tags ? {
            set: validatedData.tags.map(tagId => ({ id: tagId }))
          } : undefined
        },
        include: {
          tags: true
        }
      });

      this.logger.info(`Updated product: ${id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to update product: ${id}`, error);
      throw error;
    }
  }

  static async deleteProduct(id: string) {
    try {
      // Check if product is in any orders
      const orderCount = await db.orderItem.count({
        where: { productId: id }
      });

      if (orderCount > 0) {
        throw new AppError('Cannot delete product with existing orders', 400);
      }

      const product = await db.product.delete({
        where: { id }
      });

      this.logger.info(`Deleted product: ${id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to delete product: ${id}`, error);
      throw new AppError('Failed to delete product', 500);
    }
  }

  static async addProductTag(productId: string, tagId: string) {
    try {
      const product = await db.product.update({
        where: { id: productId },
        data: {
          tags: {
            connect: { id: tagId }
          }
        },
        include: {
          tags: true
        }
      });

      this.logger.info(`Added tag to product: ${productId}`, { tagId });
      return product;
    } catch (error) {
      this.logger.error(`Failed to add tag to product: ${productId}`, error);
      throw error;
    }
  }

  static async removeProductTag(productId: string, tagId: string) {
    try {
      const product = await db.product.update({
        where: { id: productId },
        data: {
          tags: {
            disconnect: { id: tagId }
          }
        },
        include: {
          tags: true
        }
      });

      this.logger.info(`Removed tag from product: ${productId}`, { tagId });
      return product;
    } catch (error) {
      this.logger.error(`Failed to remove tag from product: ${productId}`, error);
      throw error;
    }
  }
}
