import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/lib/services/task-service';
import { authMiddleware } from '@/lib/middleware/auth-middleware';
import { z } from 'zod';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  assignedToId: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  relatedEntityType: z.enum(['customer', 'order', 'communication']).optional(),
  relatedEntityId: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
  tags: z.array(z.string()).optional()
});

const getTasksSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  assignedToId: z.string().optional(),
  createdById: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  relatedEntityType: z.enum(['customer', 'order', 'communication']).optional(),
  relatedEntityId: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager', 'sales']);

    // Parse request body
    const body = await req.json();

    // Validate input
    const validatedData = createTaskSchema.parse({
      ...body,
      createdById: user.id
    });

    // Create task
    const task = await TaskService.createTask({
      ...validatedData,
      createdById: user.id,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
    });

    return NextResponse.json({
      success: true,
      data: task
    }, { status: 201 });
  } catch (error) {
    console.error('Task Creation Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create task'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager', 'sales']);

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate input
    const validatedParams = getTasksSchema.parse(params);

    // Retrieve tasks
    const tasks = await TaskService.getTasks({
      ...validatedParams,
      startDate: validatedParams.startDate ? new Date(validatedParams.startDate) : undefined,
      endDate: validatedParams.endDate ? new Date(validatedParams.endDate) : undefined
    });

    return NextResponse.json({
      success: true,
      data: tasks
    }, { status: 200 });
  } catch (error) {
    console.error('Task Retrieval Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve tasks'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Authenticate and authorize the request
    const user = await authMiddleware(req, ['admin', 'manager', 'sales']);

    // Parse request body
    const body = await req.json();
    const { taskId, ...updateData } = body;

    if (!taskId) {
      return NextResponse.json({
        success: false,
        message: 'Task ID is required'
      }, { status: 400 });
    }

    // Validate input
    const validatedData = updateTaskSchema.parse(updateData);

    // Update task
    const updatedTask = await TaskService.updateTask(taskId, {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
    });

    return NextResponse.json({
      success: true,
      data: updatedTask
    }, { status: 200 });
  } catch (error) {
    console.error('Task Update Error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update task'
    }, { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400 });
  }
}
