export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';

export async function GET() { 
  try {
    await connectDB();
    const userCount = await User.countDocuments();

    return NextResponse.json({ 
      success: true,
      message: 'Database connected successfully',
      userCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}


