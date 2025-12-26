import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { Project, Feedback, CheckIn, Risk } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';
import { calculateHealthScore } from '@/lib/utils/health-score';




// POST /api/Projects/[id]/calculate-health
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireRole(request, ['Admin']);

    const { id: projectId } = await params;

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get project
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get all feedback
    const feedbacks = await Feedback.find({ projectId }).lean();

    // Get all check-ins
    const checkIns = await CheckIn.find({ projectId }).lean();

    // Get all risks
    const risks = await Risk.find({ projectId }).lean();

    // Calculate health score
    const result = calculateHealthScore({
      projectId,
      startDate: project.startDate,
      endDate: project.endDate,
      feedbacks,
      checkIns,
      risks,
    });

    // Update project with new score and status
    project.healthScore = result.score;
    project.status = result.status;
    await project.save();

    return NextResponse.json({
      success: true,
      healthScore: result.score,
      status: result.status,
      breakdown: result.breakdown,
      details: result.details,
    });
  } catch (error: any) {
    console.error('Calculate health score error:', error);

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