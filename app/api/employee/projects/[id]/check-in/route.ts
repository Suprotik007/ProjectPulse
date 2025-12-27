import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { CheckIn, Project } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';
import { Types } from 'mongoose';

// GET /api/Projects/[id]/check-ins
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(request, ['Admin', 'Employee']);

    const { id: projectId } = await params;

    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Employees can only view assigned projects
    if (user.role === 'Employee') {
      const assigned = await Project.exists({
        _id: projectId,
       
      });

      if (!assigned) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    const checkIns = await CheckIn.find({ projectId })
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      total: checkIns.length,
      checkIns,
    });
  } catch (error: any) {
    console.error('Get project check-ins error:', error);

    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
