import { headers } from 'next/headers';
import { Environment } from './environment';

export async function getServerEnvironment(): Promise<Environment> {
  const headersList = await headers();
  const environment = headersList.get('x-environment') as Environment;
  
  // Fallback to development if no environment header is found
  return environment || 'development';
}
