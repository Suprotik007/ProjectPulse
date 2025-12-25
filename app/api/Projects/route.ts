import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Project } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';

// GET /api/Projects - Get all projects (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, ['Admin']);
    
    await connectDB();
    
    const projects = await Project.find()
      .populate('clientId', 'name email')
      .populate('employeeIds', 'name email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    
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

// POST /api/Projects - Create new project (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = requireRole(request, ['Admin']);
    
    const body = await request.json();
    const { name, description, startDate, endDate, clientId, employeeIds } = body;
    
    // Validation
    if (!name || !description || !startDate || !endDate || !clientId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const project = await Project.create({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      clientId,
      employeeIds: employeeIds || [],
      status: 'On Track',
      healthScore: 100,
    });
    
    // Populate references
    await project.populate('clientId', 'name email');
    await project.populate('employeeIds', 'name email');
    
    return NextResponse.json({
      success: true,
      project,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    
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