import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Risk } from '@/lib/models';
import { requireAuth } from '@/lib/utils/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = requireAuth(request);

  // Next 13 App Router: params may be a promise
  const { id: riskId } = await params; // <-- unwrap the promise

  const updates = await request.json();

  try {
    const risk = await Risk.findByIdAndUpdate(riskId, updates, { new: true });
    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, risk });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
