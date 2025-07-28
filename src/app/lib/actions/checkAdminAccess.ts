'use server';

import { auth } from '@/app/auth';
import { SingleQuery } from '@/app/lib/dbAdapter';

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return false;
    }

    const userRole = await SingleQuery(
      'SELECT role FROM users WHERE id = $1',
      [session.user.id]
    );
    
    return userRole.rows[0]?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
} 