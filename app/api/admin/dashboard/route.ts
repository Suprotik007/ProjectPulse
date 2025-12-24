import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Project, CheckIn, Risk } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // const user = requireRole(request, ['Admin']);
    
    await connectDB();
    
    // Get all projects with populated references
    const allProjects = await Project.find()
      .populate('clientId', 'name email')
      .populate('employeeIds', 'name email')
      .sort({ createdAt: -1 });
    
    // Count projects by status
    const onTrack = allProjects.filter(p => p.status === 'On Track').length;
    const atRisk = allProjects.filter(p => p.status === 'At Risk').length;
    const critical = allProjects.filter(p => p.status === 'Critical').length;
    const completed = allProjects.filter(p => p.status === 'Completed').length;
    
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const projectsWithRecentCheckIns = await CheckIn.distinct('projectId', {
      createdAt: { $gte: sevenDaysAgo },
    });
    
    const projectsMissingCheckIns = allProjects.filter(
      p => p.status !== 'Completed' && 
      !projectsWithRecentCheckIns.some(id => id.toString() === p._id.toString())
    );
    
    
    const highRiskProjectIds = await Risk.distinct('projectId', {
      severity: 'High',
      status: 'Open',
    });
    
    const highRiskProjects = allProjects.filter(p =>
      highRiskProjectIds.some(id => id.toString() === p._id.toString())
    );
    
    // Group projects by status
    const projectsByStatus = {
      'On Track': allProjects.filter(p => p.status === 'On Track'),
      'At Risk': allProjects.filter(p => p.status === 'At Risk'),
      'Critical': allProjects.filter(p => p.status === 'Critical'),
      'Completed': allProjects.filter(p => p.status === 'Completed'),
    };
    
    return NextResponse.json({
      success: true,
      summary: {
        totalProjects: allProjects.length,
        onTrack,
        atRisk,
        critical,
        completed,
      },
      projectsMissingCheckIns: projectsMissingCheckIns.map(p => ({
        _id: p._id,
        name: p.name,
        clientId: p.clientId,
      })),
      highRiskProjects: highRiskProjects.map(p => ({
        _id: p._id,
        name: p.name,
        status: p.status,
        healthScore: p.healthScore,
      })),
      projectsByStatus,
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}