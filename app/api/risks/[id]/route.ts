import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Risk } from '@/lib/models';
import { requireAuth } from '@/lib/utils/auth';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const user = requireAuth(request);


  const { id: riskId } = await context. params; 

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
