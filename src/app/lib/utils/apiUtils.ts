// Utility function to get the base URL for API calls
export function getApiBaseUrl(): string {
  return process.env.RUNTIME_ENV === 'prod' 
    ? process.env.NEXT_PUBLIC_BASE_URL || 'https://higherendeavors.com'
    : 'http://localhost:3000';
}
