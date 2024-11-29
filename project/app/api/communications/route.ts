'use client';

import { NextResponse } from 'next/server';
import { staticData } from '@/lib/data/static-data';

export async function GET() {
  return NextResponse.json(staticData.communications);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newCommunication = {
    id: Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return NextResponse.json(newCommunication);
}

export async function PUT(req: Request) {
  const data = await req.json();
  const { id, ...updates } = data;
  const communication = staticData.communications.find(c => c.id === id);
  
  if (!communication) {
    return NextResponse.json({ error: 'Communication not found' }, { status: 404 });
  }

  const updatedCommunication = {
    ...communication,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json(updatedCommunication);
}
