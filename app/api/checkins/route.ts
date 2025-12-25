import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { CheckIn, Project } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';
import { Types } from 'mongoose';

// Helper: get Monday of current week
function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // Sunday = 0
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST /api/checkins
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['Employee']);

    const body = await request.json();
    const {
      projectId,
      progressSummary,
      confidenceLevel,
      completionPercentage,
    } = body;

    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Ensure project exists and employee is assigned
    const project = await Project.findOne({
      _id: projectId,
      employeeIds: user._id,
    });

    if (!project) {
      return NextResponse.json(
        { error: 'You are not assigned to this project' },
        { status: 403 }
      );
    }

    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Enforce ONE check-in per week
    const existingCheckIn = await CheckIn.findOne({
      projectId,
      employeeId: user._id,
      createdAt: { $gte: weekStart, $lt: weekEnd },
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: 'Weekly check-in already submitted' },
        { status: 409 }
      );
    }

    const checkIn = await CheckIn.create({
      projectId,
      employeeId: user._id,
      progressSummary,
      confidenceLevel,
      completionPercentage,
    });

    return NextResponse.json(
      { success: true, checkIn },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create check-in error:', error);

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
