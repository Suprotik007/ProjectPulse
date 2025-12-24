import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export function getAuthUser(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  
  console.log('🔍 Auth Debug - Full headers:', {
    authorization: authHeader,
    allHeaders: Array.from(request.headers.entries())
  });
  
  if (!authHeader) {
    console.log('❌ No authorization header found');
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ Authorization header does not start with "Bearer "');
    console.log('   Actual value:', authHeader);
    return null;
  }

  const token = authHeader.substring(7); 
  console.log('✅ Token extracted:', token.substring(0, 20) + '...');
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    console.log('❌ Token verification failed');
    return null;
  }
  
  console.log('✅ Token verified successfully:', {
    userId: decoded.userId,
    role: decoded.role,
    email: decoded.email
  });
  
  return decoded;
}

export function requireAuth(request: NextRequest): JWTPayload {
  const user = getAuthUser(request);
  
  if (!user) {
    console.log('❌ requireAuth failed - user is null');
    throw new Error('Unauthorized');
  }
  
  console.log('✅ requireAuth passed');
  return user;
}

export function requireRole(
  request: NextRequest,
  allowedRoles: Array<'Admin' | 'Employee' | 'Client'>
): JWTPayload {
  const user = requireAuth(request);
  
  console.log('🔍 Role check:', {
    userRole: user.role,
    allowedRoles: allowedRoles,
    isAllowed: allowedRoles.includes(user.role)
  });
  
  if (!allowedRoles.includes(user.role)) {
    console.log('❌ requireRole failed - role not allowed');
    throw new Error('Forbidden');
  }
  
  console.log('✅ requireRole passed');
  return user;
}