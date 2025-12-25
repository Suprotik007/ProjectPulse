import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Project, CheckIn, Risk } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';
import { Types } from 'mongoose';

// GET /api/employee/dashboard
export async function GET(request: NextRequest) {
  try {
    // 🔐 Only Employees allowed
    const user = requireRole(request, ['Employee']);
    const employeeId = user.userId;

    if (!Types.ObjectId.isValid(employeeId)) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    await connectDB();

    /* ---------------------------
       Date range: current week
       (Monday → Sunday)
    ---------------------------- */
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    /* ---------------------------
       Get assigned projects
    ---------------------------- */
    const projects = await Project.find({
      employeeIds: employeeId,
    })
      .select('name status startDate endDate')
      .lean();

    const projectIds = projects.map((p) => p._id);

    /* ---------------------------
       Check-ins this week
    ---------------------------- */
    const weeklyCheckIns = await CheckIn.find({
      employeeId,
      projectId: { $in: projectIds },
      createdAt: { $gte: weekStart, $lt: weekEnd },
    }).select('projectId');

    const checkedInProjectIds = new Set(
      weeklyCheckIns.map((c) => c.projectId.toString())
    );

    const pendingCheckIns = projects.filter(
      (p) => !checkedInProjectIds.has(p._id.toString())
    ).length;

    /* ---------------------------
       Open risks per project
    ---------------------------- */
    const risks = await Risk.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          status: 'Open',
        },
      },
      {
        $group: {
          _id: '$projectId',
          openRisks: { $sum: 1 },
        },
      },
    ]);

    const riskMap = new Map(
      risks.map((r) => [r._id.toString(), r.openRisks])
    );

    /* ---------------------------
       Final response shaping
    ---------------------------- */
    const dashboardProjects = projects.map((project) => ({
      ...project,
      openRisks: riskMap.get(project._id.toString()) || 0,
      hasCheckedInThisWeek: checkedInProjectIds.has(
        project._id.toString()
      ),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects: projects.length,
        pendingCheckIns,
      },
      projects: dashboardProjects,
    });
  } catch (error: any) {
    console.error('Employee dashboard error:', error);

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
