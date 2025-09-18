import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock UserSettingsContext
const mockUserSettings = {
  userSettings: {
    general: {
      sidebarExpandMode: 'hover',
    },
  },
};

jest.mock('@/app/context/UserSettingsContext', () => ({
  useUserSettings: () => mockUserSettings,
}));

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any;
  userSettings?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { session = null, userSettings = mockUserSettings, ...renderOptions }: CustomRenderOptions = {}
) {
  // Update mock if custom userSettings provided
  if (userSettings !== mockUserSettings) {
    const mockUseUserSettings = require('@/app/context/UserSettingsContext').useUserSettings;
    mockUseUserSettings.mockReturnValue(userSettings);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock session data for testing
export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
  },
};

export const mockAdminSession = {
  user: {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
  },
};

// Mock API responses
export const mockApiResponses = {
  tierContinuum: [
    { tier_continuum_id: 1, tier_continuum_name: 'Beginner' },
    { tier_continuum_id: 2, tier_continuum_name: 'Intermediate' },
    { tier_continuum_id: 3, tier_continuum_name: 'Advanced' },
  ],
  exercises: [
    {
      exercise_library_id: 1,
      name: 'Push-up',
      source: 'library',
      exercise_family_id: 1,
      exercise_family: 'Upper Body',
      body_region: 'Chest',
      muscle_group: 'Pectorals',
      movement_pattern: 'Push',
      movement_plane: 'Sagittal',
      equipment: 'Bodyweight',
      laterality: 'Bilateral',
      difficulty: 'Beginner',
    },
  ],
  users: [
    { id: 1, name: 'User 1', email: 'user1@example.com', first_name: 'John', last_name: 'Doe' },
    { id: 2, name: 'User 2', email: 'user2@example.com', first_name: 'Jane', last_name: 'Smith' },
  ],
};

// Helper function to mock fetch responses
export function mockFetchResponse(data: any, status = 200) {
  const mockFetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
  global.fetch = mockFetch;
  return mockFetch;
}

// Helper function to mock database responses
export function mockDatabaseResponse(data: any) {
  const mockSingleQuery = jest.fn().mockResolvedValue({
    rows: data,
  });
  return mockSingleQuery;
}

// Helper function to create mock request
export function createMockRequest(url: string, method = 'GET') {
  return new Request(url, { method });
}

// Helper function to create mock NextRequest
export function createMockNextRequest(url: string, method = 'GET') {
  return {
    url,
    method,
    headers: new Headers(),
  } as any;
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
