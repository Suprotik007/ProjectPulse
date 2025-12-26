import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import Feedback from '@/lib/models/Feedback';
import Project from '@/lib/models/Project';
import { requireRole } from '@/lib/utils/auth';

// Helper: get Monday of current week
function getWeekStartDate() {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['Client']);
    const {
      projectId,
      satisfactionRating,
      communicationRating,
      comments,
      issueFlagged,
    } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Ensure project belongs to this client
    const project = await Project.findOne({
      _id: projectId,
      clientId: user.userId,
    });

    if (!project) {
      return NextResponse.json(
        { error: 'You are not assigned to this project' },
        { status: 403 }
      );
    }

    const weekStartDate = getWeekStartDate();

    // Prevent duplicate feedback this week
    const existing = await Feedback.findOne({
      projectId,
      clientId: user.userId,
      weekStartDate,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this week' },
        { status: 409 }
      );
    }

    const feedback = await Feedback.create({
      projectId,
      clientId: user.userId,
      weekStartDate,
      satisfactionRating,
      communicationRating,
      comments,
      issueFlagged: Boolean(issueFlagged),
    });

    // ✅ ADD THIS: Trigger health score recalculation
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/Projects/${projectId}/calculate-health`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to update health score');
      }
    } catch (error) {
      console.error('Error triggering health calculation:', error);
      // Don't fail the request if health calc fails
    }

    return NextResponse.json(
      { success: true, feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}