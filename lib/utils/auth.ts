import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export function getAuthUser(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  
 
  
  if (!authHeader) {
   
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
   
    return null;
  }

  const token = authHeader.substring(7); 
 
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
   
    return null;
  }
  
  
  return decoded;
}

export function requireAuth(request: NextRequest): JWTPayload {
  const user = getAuthUser(request);
  
  if (!user) {
    
    throw new Error('Unauthorized');
  }
  
  return user;
}

export function requireRole(
  request: NextRequest,
  allowedRoles: Array<'Admin' | 'Employee' | 'Client'>
): JWTPayload {
  const user = requireAuth(request);
  
 
  
  if (!allowedRoles.includes(user.role)) {
   
    throw new Error('Forbidden');
  }
  
  
  return user;
}