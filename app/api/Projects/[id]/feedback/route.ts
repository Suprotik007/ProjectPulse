import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import Feedback from '@/lib/models/Feedback';
import Project from '@/lib/models/Project';
import { requireAuth, requireRole } from '@/lib/utils/auth';

// GET /api/projects/[id]/feedback - Get all feedback for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(request, ['Admin', 'Employee', 'Client']);

    const { id: projectId } = await params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Client isolation - clients can only see feedback for their own projects
    if (user.role === 'Client' && project.clientId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const feedback = await Feedback.find({ projectId })
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      feedback,
      project: {
        _id: project._id,
        name: project.name,
      },
    });
  } catch (error: any) {
    console.error('Get feedback error:', error);

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

// POST /api/projects/[id]/feedback - Submit new feedback (Client only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireRole(request, ['Client']);

    // Await params in Next.js 15
    const { id: projectId } = await params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { satisfactionRating, communicationRating, comments, issueFlagged } = body;

    // Validation
    if (!satisfactionRating || !communicationRating) {
      return NextResponse.json(
        { error: 'Satisfaction and communication ratings are required' },
        { status: 400 }
      );
    }

    if (
      satisfactionRating < 1 ||
      satisfactionRating > 5 ||
      communicationRating < 1 ||
      communicationRating > 5
    ) {
      return NextResponse.json(
        { error: 'Ratings must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if project exists and user is the client
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.clientId.toString() !== user.userId) {
      return NextResponse.json(
        { error: 'You can only submit feedback for your own projects' },
        { status: 403 }
      );
    }

    // Get week start date (Monday of current week)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() + diff);
    weekStartDate.setHours(0, 0, 0, 0);

    // Check if feedback already exists for this week
    const existingFeedback = await Feedback.findOne({
      projectId,
      clientId: user.userId,
      weekStartDate,
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'You have already submitted feedback for this week' },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await Feedback.create({
      projectId,
      clientId: user.userId,
      weekStartDate,
      satisfactionRating,
      communicationRating,
      comments: comments || '',
      issueFlagged: issueFlagged || false,
    });

    await feedback.populate('clientId', 'name email');

    return NextResponse.json({
      success: true,
      feedback,
      message: 'Feedback submitted successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Submit feedback error:', error);

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