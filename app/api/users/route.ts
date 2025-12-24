import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { requireRole } from '@/lib/utils/auth';

// GET /api/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = requireRole(request, ['Admin']);
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    await connectDB();
    
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}