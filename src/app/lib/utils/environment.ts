export type Environment = 'development' | 'qa' | 'production';

export function detectEnvironment(hostname: string): Environment {
  // Remove port numbers and protocol
  const cleanHostname = hostname.split(':')[0].toLowerCase();
  
  if (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1') {
    return 'development';
  }
  
  if (cleanHostname === 'qa.higherendeavors.com') {
    return 'qa';
  }
  
  if (cleanHostname === 'higherendeavors.com' || cleanHostname === 'www.higherendeavors.com') {
    return 'production';
  }
  
  // Default fallback - could be development or production
  // You might want to adjust this based on your deployment strategy
  return 'development';
}

export function getEnvironmentFromHeaders(headers: Headers): Environment {
  const host = headers.get('host') || '';
  return detectEnvironment(host);
}
