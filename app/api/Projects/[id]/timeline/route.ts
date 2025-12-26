import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { requireAuth } from '@/lib/utils/auth';
import Project from '@/lib/models/Project';
import CheckIn from '@/lib/models/CheckIn';
import Feedback from '@/lib/models/Feedback';
import Risk from '@/lib/models/Risk';

/**
 * GET /api/projects/[id]/timeline
 * Returns merged activity timeline for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = requireAuth(request);
    const { id: projectId } = await params;

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // ----------------------------
    // 🔐 Access control
    // ----------------------------
    const isAdmin = user.role === 'Admin';
    const isEmployee = project.employeeIds?.some(
      (id: any) => id.toString() === user.userId
    );
    const isClient = project.clientId?.toString() === user.userId;

    if (!isAdmin && !isEmployee && !isClient) {
      return NextResponse.json(
        { error: 'Not authorized to view this project timeline' },
        { status: 403 }
      );
    }

    // ----------------------------
    // Fetch activities in parallel
    // ----------------------------
    const [checkIns, feedbacks, risks] = await Promise.all([
      CheckIn.find({ projectId })
        .populate('employeeId', 'name role')
        .sort({ createdAt: -1 })
        .lean(),

      Feedback.find({ projectId })
        .populate('clientId', 'name role')
        .sort({ createdAt: -1 })
        .lean(),

      Risk.find({ projectId })
        .populate('employeeId', 'name role')
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    // ----------------------------
    // Normalize into timeline items
    // ----------------------------
    const timeline = [
      ...checkIns.map((ci: any) => ({
        _id: ci._id,
        type: 'checkin',
        title: 'Weekly Check-in Submitted',
        description: ci.progressSummary,
        createdAt: ci.createdAt,
        actor: ci.employeeId
          ? {
              _id: ci.employeeId._id,
              name: ci.employeeId.name,
              role: ci.employeeId.role || 'Employee',
            }
          : null,
        meta: {
          confidenceLevel: ci.confidenceLevel,
          completionPercentage: ci.completionPercentage,
        },
      })),

      ...feedbacks.map((fb: any) => ({
        _id: fb._id,
        type: 'feedback',
        title: 'Client Feedback Submitted',
        description: fb.comments || 'No additional comments',
        createdAt: fb.createdAt,
        actor: fb.clientId
          ? {
              _id: fb.clientId._id,
              name: fb.clientId.name,
              role: fb.clientId.role || 'Client',
            }
          : null,
        meta: {
          satisfaction: fb.satisfactionRating,
          communication: fb.communicationRating,
          flagged: fb.issueFlagged,
        },
      })),

      ...risks.map((risk: any) => ({
        _id: risk._id,
        type: 'risk',
        title:
          risk.status === 'Resolved'
            ? 'Risk Resolved'
            : 'Risk Created / Updated',
        description: risk.title,
        createdAt: risk.updatedAt || risk.createdAt,
        actor: risk.employeeId
          ? {
              _id: risk.employeeId._id,
              name: risk.employeeId.name,
              role: risk.employeeId.role || 'Employee',
            }
          : null,
        meta: {
          severity: risk.severity,
          status: risk.status,
        },
      })),
    ];

    // ----------------------------
    // Sort newest → oldest
    // ----------------------------
    timeline.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      projectId,
      projectName: project.name,
      totalActivities: timeline.length,
      timeline,
    });
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to load project timeline' },
      { status: 500 }
    );
  }
}
