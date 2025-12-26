import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Project, Feedback, CheckIn, Risk } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';
import { calculateHealthScore } from '@/lib/utils/health-score';


export async function POST(request: NextRequest) {
  try {
    requireRole(request, ['Admin']);

    await connectDB();

    const projects = await Project.find();

    const results = [];

    for (const project of projects) {
      // Get project data
      const feedbacks = await Feedback.find({ projectId: project._id }).lean();
      const checkIns = await CheckIn.find({ projectId: project._id }).lean();
      const risks = await Risk.find({ projectId: project._id }).lean();

      // Calculate health score
      const result = calculateHealthScore({
        projectId: project._id,
        startDate: project.startDate,
        endDate: project.endDate,
        feedbacks,
        checkIns,
        risks,
      });

      // Update project
      project.healthScore = result.score;
      project.status = result.status;
      await project.save();

      results.push({
        projectId: project._id,
        projectName: project.name,
        oldScore: project.healthScore,
        newScore: result.score,
        status: result.status,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated health scores for ${projects.length} projects`,
      results,
    });
  } catch (error: any) {
    console.error('Recalculate all health scores error:', error);

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