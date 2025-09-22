// Mock API responses for testing
export const mockApiResponses = {
  users: {
    success: {
      users: [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
        {
          id: '2',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
      ],
    },
    error: {
      error: 'Failed to fetch users',
      status: 500,
    },
  },
  exercises: {
    success: {
      exercises: [
        {
          id: '1',
          name: 'Bench Press',
          category: 'chest',
          equipment: 'barbell',
        },
        {
          id: '2',
          name: 'Squat',
          category: 'legs',
          equipment: 'barbell',
        },
      ],
    },
    error: {
      error: 'Failed to fetch exercises',
      status: 500,
    },
  },
  tierContinuum: {
    success: {
      tiers: [
        { id: '1', name: 'Beginner', level: 1 },
        { id: '2', name: 'Intermediate', level: 2 },
        { id: '3', name: 'Advanced', level: 3 },
      ],
    },
    error: {
      error: 'Failed to fetch tier continuum',
      status: 500,
    },
  },
};
