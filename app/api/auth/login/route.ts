
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/utils/jwt';


const MOCK_USERS = [
  {
    id: '1',
    name: 'MR. Admin ',
    email: 'admin@projectpulse.com',
    password: 'admin123', 
    role: 'Admin' as const,
  },
  {
    id: '2',
    name: 'John Employee',
    email: 'employee@projectpulse.com',
    password: 'emp123',
    role: 'Employee' as const,
  },
  {
    id: '3',
    name: 'Jane Client',
    email: 'client@projectpulse.com',
    password: 'client123',
    role: 'Client' as const,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }


    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

   
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Return user info and token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}