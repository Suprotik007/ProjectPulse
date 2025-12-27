import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Risk from '@/lib/models/Risk';
import { requireAuth } from '@/lib/utils/auth';

// GET /api/risks?projectId=xxx - List risks (with optional filter)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(request);

    // ✅ Only use searchParams, NO params.id here
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

// POST /api/risks - Create new risk
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(request);

    const body = await request.json();
    const { projectId, title, severity, mitigationPlan, status } = body;

    if (!projectId || !title || !severity) {
      return NextResponse.json(
        { error: 'projectId, title, and severity are required' },
        { status: 400 }
      );
    }

    const risk = await Risk.create({
      projectId,
      employeeId: user.userId,
      title,
      severity,
      mitigationPlan: mitigationPlan || 'To be determined',
      status: status || 'Open',
    });

    // Trigger health score recalculation
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/api/Projects/${projectId}/calculate-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error triggering health calculation:', error);
    }

    return NextResponse.json({ success: true, risk }, { status: 201 });
  } catch (err: any) {
    console.error('POST risk error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create risk' },
      { status: 500 }
    );
  }
}