import { GET } from '../users/route';
import { NextRequest } from 'next/server';

// Mock database adapter
const mockSingleQuery = jest.fn();

jest.mock('@/app/lib/dbAdapter', () => ({
  SingleQuery: (...args: any[]) => mockSingleQuery(...args),
}));

// Mock auth
const mockAuth = jest.fn();

jest.mock('@/app/auth', () => ({
  auth: () => mockAuth(),
}));

// Mock server logger
const mockServerLogger = {
  error: jest.fn(),
};

jest.mock('@/app/lib/logging/logger.server', () => ({
  serverLogger: mockServerLogger,
}));

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns users list for admin user', async () => {
      const mockSession = {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
        },
      };

      const mockUserRole = {
        rows: [{ role: 'admin' }],
      };

      const mockUsers = {
        rows: [
          { id: 1, name: 'User 1', email: 'user1@example.com', first_name: 'John', last_name: 'Doe' },
          { id: 2, name: 'User 2', email: 'user2@example.com', first_name: 'Jane', last_name: 'Smith' },
        ],
      };

      mockAuth.mockResolvedValue(mockSession);
      mockSingleQuery
        .mockResolvedValueOnce(mockUserRole)
        .mockResolvedValueOnce(mockUsers);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toEqual(mockUsers.rows);
      expect(mockSingleQuery).toHaveBeenCalledWith(
        'SELECT role FROM users WHERE id = $1',
        ['1']
      );
      expect(mockSingleQuery).toHaveBeenCalledWith(
        'SELECT id, name, email, first_name, last_name FROM users ORDER BY COALESCE(first_name, name, email)',
        []
      );
    });

    it('returns 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 for user without ID', async () => {
      mockAuth.mockResolvedValue({
        user: {
          name: 'User without ID',
          email: 'user@example.com',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 403 for non-admin user', async () => {
      const mockSession = {
        user: {
          id: '2',
          name: 'Regular User',
          email: 'user@example.com',
        },
      };

      const mockUserRole = {
        rows: [{ role: 'user' }],
      };

      mockAuth.mockResolvedValue(mockSession);
      mockSingleQuery.mockResolvedValue(mockUserRole);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('returns 403 for user without role', async () => {
      const mockSession = {
        user: {
          id: '3',
          name: 'User without role',
          email: 'user@example.com',
        },
      };

      const mockUserRole = {
        rows: [],
      };

      mockAuth.mockResolvedValue(mockSession);
      mockSingleQuery.mockResolvedValue(mockUserRole);

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('handles database errors gracefully', async () => {
      const mockSession = {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
        },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockSingleQuery.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockServerLogger.error).toHaveBeenCalledWith(
        'Error in users API route',
        expect.any(Error)
      );
    });

    it('handles auth errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

      const request = new NextRequest('http://localhost:3000/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(mockServerLogger.error).toHaveBeenCalledWith(
        'Error in users API route',
        expect.any(Error)
      );
    });
  });
});
