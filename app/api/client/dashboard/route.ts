import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Project, Feedback } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Ensure only clients can access
    const user = requireRole(request, ['Client']);

    await connectDB();

    // Fetch projects where logged-in user is the client
    const projects = await Project.find({ clientId: user.userId }).sort({ startDate: -1 });

    // Attach last feedback date for each project
    const projectsWithFeedback = await Promise.all(
      projects.map(async (project) => {
        const lastFeedback = await Feedback.findOne({ projectId: project._id })
          .sort({ weekStartDate: -1 })
          .select('weekStartDate');
        return {
          id: project._id,
          name: project.name,
          status: project.status,
          healthScore: project.healthScore,
          lastFeedbackDate: lastFeedback?.weekStartDate || null,
        };
      })
    );

    return NextResponse.json({ success: true, projects: projectsWithFeedback });
  } catch (error: any) {
    console.error('Client dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
