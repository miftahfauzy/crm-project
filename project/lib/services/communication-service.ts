import { db } from '../prisma';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';
import { communicationSchema } from '../validation';

export class CommunicationService {
  private static logger = createLogger('CommunicationService');

  static async createCommunication(data: {
    customerId: string;
    userId: string;
    type: 'email' | 'phone' | 'meeting' | 'chat' | 'sms';
    content: string;
    direction?: 'inbound' | 'outbound';
    status?: 'pending' | 'completed' | 'failed';
    scheduledAt?: Date;
    tags?: string[];
  }) {
    try {
      const validatedData = communicationSchema.parse(data);

      // Verify customer exists
      const customer = await db.customer.findUnique({
        where: { id: validatedData.customerId }
      });

      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      const communication = await db.communication.create({
        data: {
          ...validatedData,
          tags: validatedData.tags ? {
            connect: validatedData.tags.map(tagId => ({ id: tagId }))
          } : undefined
        },
        include: {
          customer: true,
          tags: true
        }
      });

      this.logger.info(`Communication created: ${communication.id}`, { 
        customerId: communication.customerId, 
        type: communication.type 
      });

      return communication;
    } catch (error) {
      this.logger.error('Failed to create communication', error);
      throw error;
    }
  }

  static async getCommunications(options?: {
    page?: number;
    limit?: number;
    customerId?: string;
    userId?: string;
    type?: 'email' | 'phone' | 'meeting' | 'chat' | 'sms';
    direction?: 'inbound' | 'outbound';
    status?: 'pending' | 'completed' | 'failed';
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const customerId = options?.customerId;
      const userId = options?.userId;
      const type = options?.type;
      const direction = options?.direction;
      const status = options?.status;
      const startDate = options?.startDate;
      const endDate = options?.endDate;

      const skip = (page - 1) * limit;

      const where = {
        AND: [
          customerId ? { customerId } : {},
          userId ? { userId } : {},
          type ? { type } : {},
          direction ? { direction } : {},
          status ? { status } : {},
          startDate ? { createdAt: { gte: startDate } } : {},
          endDate ? { createdAt: { lte: endDate } } : {}
        ]
      };

      const [communications, total] = await Promise.all([
        db.communication.findMany({
          where,
          skip,
          take: limit,
          include: {
            customer: true,
            tags: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        db.communication.count({ where })
      ]);

      this.logger.info(`Retrieved communications: page ${page}, total ${total}`);

      return {
        communications,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error('Failed to retrieve communications', error);
      throw new AppError('Failed to retrieve communications', 500);
    }
  }

  static async getCommunicationById(id: string) {
    try {
      const communication = await db.communication.findUnique({
        where: { id },
        include: {
          customer: true,
          tags: true
        }
      });

      if (!communication) {
        throw new AppError('Communication not found', 404);
      }

      this.logger.info(`Retrieved communication: ${id}`);
      return communication;
    } catch (error) {
      this.logger.error(`Failed to retrieve communication: ${id}`, error);
      throw error;
    }
  }

  static async updateCommunicationStatus(id: string, status: 'pending' | 'completed' | 'failed') {
    try {
      const communication = await db.communication.update({
        where: { id },
        data: { status },
        include: {
          customer: true,
          tags: true
        }
      });

      this.logger.info(`Updated communication status: ${id}`, { status });
      return communication;
    } catch (error) {
      this.logger.error(`Failed to update communication status: ${id}`, error);
      throw new AppError('Failed to update communication status', 500);
    }
  }

  static async deleteCommunication(id: string) {
    try {
      const communication = await db.communication.delete({
        where: { id }
      });

      this.logger.info(`Deleted communication: ${id}`);
      return communication;
    } catch (error) {
      this.logger.error(`Failed to delete communication: ${id}`, error);
      throw new AppError('Failed to delete communication', 500);
    }
  }

  static async addCommunicationTag(communicationId: string, tagId: string) {
    try {
      const communication = await db.communication.update({
        where: { id: communicationId },
        data: {
          tags: {
            connect: { id: tagId }
          }
        },
        include: {
          tags: true
        }
      });

      this.logger.info(`Added tag to communication: ${communicationId}`, { tagId });
      return communication;
    } catch (error) {
      this.logger.error(`Failed to add tag to communication: ${communicationId}`, error);
      throw error;
    }
  }

  static async removeCommunicationTag(communicationId: string, tagId: string) {
    try {
      const communication = await db.communication.update({
        where: { id: communicationId },
        data: {
          tags: {
            disconnect: { id: tagId }
          }
        },
        include: {
          tags: true
        }
      });

      this.logger.info(`Removed tag from communication: ${communicationId}`, { tagId });
      return communication;
    } catch (error) {
      this.logger.error(`Failed to remove tag from communication: ${communicationId}`, error);
      throw error;
    }
  }

  static async getCustomerCommunicationSummary(customerId: string) {
    try {
      const summary = await db.communication.groupBy({
        by: ['type', 'direction', 'status'],
        where: { customerId },
        _count: {
          id: true
        }
      });

      this.logger.info(`Retrieved communication summary for customer: ${customerId}`);
      return summary;
    } catch (error) {
      this.logger.error(`Failed to retrieve communication summary: ${customerId}`, error);
      throw new AppError('Failed to retrieve communication summary', 500);
    }
  }

  static async generateCommunicationReport(options?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    type?: 'email' | 'phone' | 'meeting' | 'chat' | 'sms';
  }) {
    try {
      const startDate = options?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
      const endDate = options?.endDate || new Date();
      const userId = options?.userId;
      const type = options?.type;

      // Aggregate communication statistics
      const communicationStats = await db.communication.groupBy({
        by: ['type', 'direction', 'status'],
        where: {
          AND: [
            { createdAt: { gte: startDate } },
            { createdAt: { lte: endDate } },
            userId ? { userId } : {},
            type ? { type } : {}
          ]
        },
        _count: { 
          id: true 
        },
        _avg: {
          duration: true
        }
      });

      // Top communicators
      const topCommunicators = await db.communication.groupBy({
        by: ['userId'],
        where: {
          AND: [
            { createdAt: { gte: startDate } },
            { createdAt: { lte: endDate } },
            type ? { type } : {}
          ]
        },
        _count: { 
          id: true 
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      });

      // Resolve user details for top communicators
      const topCommunicatorsWithDetails = await Promise.all(
        topCommunicators.map(async (communicator) => {
          const user = await db.user.findUnique({
            where: { id: communicator.userId as string },
            select: { 
              id: true, 
              name: true, 
              email: true 
            }
          });

          return {
            ...communicator,
            user
          };
        })
      );

      this.logger.info('Generated communication report', { 
        startDate, 
        endDate, 
        userId 
      });

      return {
        stats: communicationStats,
        topCommunicators: topCommunicatorsWithDetails,
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    } catch (error) {
      this.logger.error('Failed to generate communication report', error);
      throw new AppError('Failed to generate communication report', 500);
    }
  }

  static async scheduleFollowUp(data: {
    originalCommunicationId: string;
    scheduledAt: Date;
    type: 'email' | 'phone' | 'meeting' | 'chat' | 'sms';
    content: string;
    userId: string;
  }) {
    try {
      // Verify original communication exists
      const originalCommunication = await db.communication.findUnique({
        where: { id: data.originalCommunicationId },
        include: { customer: true }
      });

      if (!originalCommunication) {
        throw new AppError('Original communication not found', 404);
      }

      // Create follow-up communication
      const followUpCommunication = await db.communication.create({
        data: {
          customerId: originalCommunication.customerId,
          userId: data.userId,
          type: data.type,
          content: data.content,
          scheduledAt: data.scheduledAt,
          status: 'pending',
          direction: 'outbound',
          parentCommunicationId: data.originalCommunicationId
        },
        include: {
          customer: true
        }
      });

      this.logger.info(`Follow-up communication scheduled: ${followUpCommunication.id}`, {
        originalCommunicationId: data.originalCommunicationId,
        scheduledAt: data.scheduledAt
      });

      return followUpCommunication;
    } catch (error) {
      this.logger.error('Failed to schedule follow-up communication', error);
      throw error;
    }
  }

  static async analyzeCommunicationEffectiveness(options?: {
    startDate?: Date;
    endDate?: Date;
    type?: 'email' | 'phone' | 'meeting' | 'chat' | 'sms';
  }) {
    try {
      const startDate = options?.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default 90 days
      const endDate = options?.endDate || new Date();
      const type = options?.type;

      // Analyze communication effectiveness
      const communicationEffectiveness = await db.communication.findMany({
        where: {
          AND: [
            { createdAt: { gte: startDate } },
            { createdAt: { lte: endDate } },
            type ? { type } : {}
          ]
        },
        include: {
          customer: {
            include: {
              orders: {
                where: {
                  createdAt: { gte: startDate }
                }
              }
            }
          }
        }
      });

      // Calculate conversion rates and engagement metrics
      const effectivenessAnalysis = communicationEffectiveness.map(comm => ({
        communicationId: comm.id,
        type: comm.type,
        customerOrders: comm.customer.orders.length,
        orderValue: comm.customer.orders.reduce((sum, order) => sum + order.total, 0),
        conversionRate: comm.customer.orders.length > 0 ? 1 : 0
      }));

      const aggregatedEffectiveness = {
        byType: effectivenessAnalysis.reduce((acc, curr) => {
          if (!acc[curr.type]) {
            acc[curr.type] = {
              totalCommunications: 0,
              totalConversions: 0,
              totalOrderValue: 0
            };
          }
          acc[curr.type].totalCommunications++;
          acc[curr.type].totalConversions += curr.conversionRate;
          acc[curr.type].totalOrderValue += curr.orderValue;
          return acc;
        }, {} as Record<string, { totalCommunications: number; totalConversions: number; totalOrderValue: number }>)
      };

      this.logger.info('Analyzed communication effectiveness', { 
        startDate, 
        endDate 
      });

      return {
        effectivenessAnalysis,
        aggregatedEffectiveness
      };
    } catch (error) {
      this.logger.error('Failed to analyze communication effectiveness', error);
      throw new AppError('Failed to analyze communication effectiveness', 500);
    }
  }
}
