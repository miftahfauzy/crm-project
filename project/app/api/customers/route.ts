import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/prisma';

const CustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = CustomerSchema.parse(body);

    const customer = await db.customer.create({
      data: {
        ...validatedData,
        tags: {
          connect: validatedData.tags?.map(tagId => ({ id: tagId })) || []
        }
      },
      include: {
        tags: true
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const customers = await db.customer.findMany({
      where,
      skip,
      take: limit,
      include: {
        tags: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await db.customer.count({ where });

    return NextResponse.json({
      customers: customers.map(customer => ({
        ...customer,
        totalOrders: customer._count.orders
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}