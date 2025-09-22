// Mock for next-auth
import React from 'react';

export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const auth = jest.fn(() => Promise.resolve(mockSession));

export const useSession = jest.fn(() => ({
  data: mockSession,
  status: 'authenticated',
}));

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', null, children);
};
