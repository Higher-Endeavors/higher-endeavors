// Utility function to get the base URL for API calls
export function getApiBaseUrl(): string {
  return process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
    : 'http://localhost:3000';
}
