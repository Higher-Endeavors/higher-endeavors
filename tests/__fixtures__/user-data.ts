// Mock user data for testing
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAdminUser = {
  id: '2',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAdminSession = {
  user: mockAdminUser,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};
