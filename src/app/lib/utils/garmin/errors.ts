export class GarminAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'GarminAPIError';
  }
}

export function handleGarminAPIError(error: any): never {
  if (error instanceof GarminAPIError) {
    throw error;
  }

  // Handle specific Garmin API error responses
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.errorMessage || error.message;

    switch (status) {
      case 400:
        throw new GarminAPIError('Invalid request parameters', 400, message);
      case 401:
        throw new GarminAPIError('Unauthorized request', 401, message);
      case 403:
        throw new GarminAPIError('Invalid or revoked user access token', 403, message);
      case 409:
        throw new GarminAPIError('Duplicate backfill request', 409, message);
      case 412:
        throw new GarminAPIError('User has not granted permission for this data type', 412, message);
      case 500:
        throw new GarminAPIError('Garmin API server error', 500, message);
      default:
        throw new GarminAPIError('Unknown Garmin API error', status, message);
    }
  }

  throw new GarminAPIError('Network or connection error', 0, error.message);
}

export function validateTimestamp(timestamp: number): void {
  // Check if timestamp appears to be in milliseconds
  if (timestamp > 100000000000) {
    throw new GarminAPIError(
      'Timestamp appears to be in milliseconds. Please provide Unix timestamps in seconds.',
      400
    );
  }
} 