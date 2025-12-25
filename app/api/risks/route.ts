import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Risk from '@/lib/models/Risk';
import { requireAuth } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(request); // must be logged in

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const filter = projectId ? { projectId } : {};
    const risks = await Risk.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, risks });
  } catch (err: any) {
    console.error('GET risks error:', err);
    return NextResponse.json({ error: 'Failed to fetch risks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(request);

    const body = await request.json();
    const { projectId, title, severity, mitigationPlan, status } = body;

    if (!projectId || !title || !severity) {
      return NextResponse.json({ error: 'projectId, title, and severity are required' }, { status: 400 });
    }

    const risk = await Risk.create({
      projectId,
      employeeId: user.userId, // assign creator automatically
      title,
      severity,
      mitigationPlan: mitigationPlan || '',
      status: status || 'Open',
    });

    return NextResponse.json({ success: true, risk });
  } catch (err: any) {
    console.error('POST risk error:', err);
    return NextResponse.json({ error: 'Failed to create risk' }, { status: 500 });
  }
}
