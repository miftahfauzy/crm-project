import { db } from '../prisma';
import { createLogger } from '../logger';
import { AppError } from '../error-handler';
import { taskSchema } from '../validation';

export class TaskService {
  private static logger = createLogger('TaskService');

  static async createTask(data: {
    title: string;
    description?: string;
    assignedToId: string;
    createdById: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'todo' | 'in_progress' | 'review' | 'done';
    dueDate?: Date;
    tags?: string[];
    relatedEntityType?: 'customer' | 'order' | 'communication';
    relatedEntityId?: string;
  }) {
    try {
      const validatedData = taskSchema.parse(data);

      // Verify assigned user exists
      const assignedUser = await db.user.findUnique({
        where: { id: validatedData.assignedToId }
      });

      if (!assignedUser) {
        throw new AppError('Assigned user not found', 404);
      }

      const task = await db.task.create({
        data: {
          ...validatedData,
          tags: validatedData.tags ? {
            connect: validatedData.tags.map(tagId => ({ id: tagId }))
          } : undefined,
          status: validatedData.status || 'todo',
          priority: validatedData.priority || 'medium'
        },
        include: {
          assignedTo: true,
          createdBy: true,
          tags: true
        }
      });

      this.logger.info(`Task created: ${task.id}`, { 
        title: task.title, 
        assignedToId: task.assignedToId 
      });

      return task;
    } catch (error) {
      this.logger.error('Failed to create task', error);
      throw error;
    }
  }

  static async getTasks(options?: {
    page?: number;
    limit?: number;
    assignedToId?: string;
    createdById?: string;
    status?: 'todo' | 'in_progress' | 'review' | 'done';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    startDate?: Date;
    endDate?: Date;
    relatedEntityType?: 'customer' | 'order' | 'communication';
    relatedEntityId?: string;
  }) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      const where = {
        AND: [
          options?.assignedToId ? { assignedToId: options.assignedToId } : {},
          options?.createdById ? { createdById: options.createdById } : {},
          options?.status ? { status: options.status } : {},
          options?.priority ? { priority: options.priority } : {},
          options?.startDate ? { dueDate: { gte: options.startDate } } : {},
          options?.endDate ? { dueDate: { lte: options.endDate } } : {},
          options?.relatedEntityType ? { relatedEntityType: options.relatedEntityType } : {},
          options?.relatedEntityId ? { relatedEntityId: options.relatedEntityId } : {}
        ]
      };

      const [tasks, total] = await Promise.all([
        db.task.findMany({
          where,
          skip,
          take: limit,
          include: {
            assignedTo: true,
            createdBy: true,
            tags: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        db.task.count({ where })
      ]);

      this.logger.info(`Retrieved tasks: page ${page}, total ${total}`);

      return {
        tasks,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error('Failed to retrieve tasks', error);
      throw new AppError('Failed to retrieve tasks', 500);
    }
  }

  static async updateTask(taskId: string, data: {
    title?: string;
    description?: string;
    status?: 'todo' | 'in_progress' | 'review' | 'done';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: Date;
    assignedToId?: string;
    tags?: string[];
  }) {
    try {
      const task = await db.task.findUnique({ where: { id: taskId } });
      if (!task) {
        throw new AppError('Task not found', 404);
      }

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          ...data,
          tags: data.tags ? {
            set: data.tags.map(tagId => ({ id: tagId }))
          } : undefined
        },
        include: {
          assignedTo: true,
          createdBy: true,
          tags: true
        }
      });

      this.logger.info(`Task updated: ${taskId}`, { 
        status: updatedTask.status, 
        priority: updatedTask.priority 
      });

      return updatedTask;
    } catch (error) {
      this.logger.error(`Failed to update task: ${taskId}`, error);
      throw new AppError('Failed to update task', 500);
    }
  }

  static async getTeamProductivity(options?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const startDate = options?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
      const endDate = options?.endDate || new Date();

      const teamProductivity = await db.task.groupBy({
        by: ['assignedToId'],
        where: {
          status: 'done',
          updatedAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        _avg: {
          completionTime: true
        }
      });

      // Resolve user details
      const productivityWithUserDetails = await Promise.all(
        teamProductivity.map(async (productivity) => {
          const user = await db.user.findUnique({
            where: { id: productivity.assignedToId as string },
            select: { 
              id: true, 
              name: true, 
              email: true 
            }
          });

          return {
            ...productivity,
            user
          };
        })
      );

      this.logger.info('Generated team productivity report', { 
        startDate, 
        endDate 
      });

      return {
        productivity: productivityWithUserDetails,
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    } catch (error) {
      this.logger.error('Failed to generate team productivity report', error);
      throw new AppError('Failed to generate team productivity report', 500);
    }
  }
}
