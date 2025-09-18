import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import UserSidebar from '../../components/UserSidebar';

// Mock next-auth
const mockUseSession = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock UserSettingsContext
jest.mock('@/app/context/UserSettingsContext', () => ({
  useUserSettings: jest.fn(() => ({
    userSettings: {
      general: {
        sidebarExpandMode: 'hover',
      },
    },
  })),
}));

// Mock client utilities
jest.mock('@/app/lib/utils/clientUtils', () => ({
  getFetchBaseUrl: jest.fn(() => Promise.resolve('http://localhost:3000')),
}));

// Mock client logger
jest.mock('@/app/lib/logging/logger.client', () => ({
  clientLogger: {
    error: jest.fn(),
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_COGNITO_CLIENT = 'test-client-id';

describe('Sidebar Navigation Integration', () => {
  const mockSetExpanded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Desktop Navigation Flow', () => {
    it('expands sidebar on hover in hover mode', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const sidebar = screen.getByRole('navigation').closest('div');
      fireEvent.mouseEnter(sidebar!);

      expect(mockSetExpanded).toHaveBeenCalledWith(true);
    });

    it('collapses sidebar on mouse leave in hover mode', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const sidebar = screen.getByRole('navigation').closest('div');
      fireEvent.mouseLeave(sidebar!);

      expect(mockSetExpanded).toHaveBeenCalledWith(false);
    });

    it('expands sidebar on click in click mode', () => {
      // Mock click mode
      const mockUseUserSettings = require('@/app/context/UserSettingsContext').useUserSettings;
      mockUseUserSettings.mockReturnValue({
        userSettings: {
          general: {
            sidebarExpandMode: 'click',
          },
        },
      });

      render(
        <SessionProvider>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const avatar = screen.getByText('TU');
      fireEvent.click(avatar);

      expect(mockSetExpanded).toHaveBeenCalledWith(true);
    });
  });

  describe('Mobile Navigation Flow', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
    });

    it('shows hamburger menu when sidebar is collapsed', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();
    });

    it('opens sidebar when hamburger menu is clicked', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
      fireEvent.click(hamburgerButton);

      expect(mockSetExpanded).toHaveBeenCalledWith(true);
    });

    it('shows backdrop when sidebar is open', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-40');
      expect(backdrop).toBeInTheDocument();
    });

    it('closes sidebar when backdrop is clicked', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-40');
      fireEvent.click(backdrop!);

      expect(mockSetExpanded).toHaveBeenCalledWith(false);
    });
  });

  describe('Section Navigation Flow', () => {
    it('expands lifestyle section and shows sub-links', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const lifestyleButton = screen.getByText(/lifestyle/i);
      fireEvent.click(lifestyleButton);

      expect(screen.getByText(/goal tracker/i)).toBeInTheDocument();
      expect(screen.getByText(/sleep quality assessment/i)).toBeInTheDocument();
    });

    it('expands health section and shows sub-links', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const healthButton = screen.getByText(/health/i);
      fireEvent.click(healthButton);

      expect(screen.getByText(/breathing/i)).toBeInTheDocument();
      expect(screen.getByText(/body composition tracker/i)).toBeInTheDocument();
    });

    it('expands nutrition section and shows sub-links', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const nutritionButton = screen.getByText(/nutrition/i);
      fireEvent.click(nutritionButton);

      expect(screen.getByText(/nutrition tracker/i)).toBeInTheDocument();
    });

    it('expands fitness section and shows sub-links', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const fitnessButton = screen.getByText(/fitness/i);
      fireEvent.click(fitnessButton);

      expect(screen.getByText(/fitness planning/i)).toBeInTheDocument();
      expect(screen.getByText(/resistance training/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiometabolic endurance training/i)).toBeInTheDocument();
      expect(screen.getByText(/structural balance/i)).toBeInTheDocument();
    });

    it('collapses section when clicked again', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const lifestyleButton = screen.getByText(/lifestyle/i);
      
      // Expand section
      fireEvent.click(lifestyleButton);
      expect(screen.getByText(/goal tracker/i)).toBeInTheDocument();
      
      // Collapse section
      fireEvent.click(lifestyleButton);
      expect(screen.queryByText(/goal tracker/i)).not.toBeInTheDocument();
    });
  });

  describe('User Profile Integration', () => {
    it('displays user initials correctly', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      expect(screen.getByText('TU')).toBeInTheDocument(); // Test User initials
    });

    it('displays user full name when expanded', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('provides access to user bio and settings', () => {
      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const bioLink = screen.getByRole('link', { name: /user bio/i });
      const settingsLink = screen.getByRole('link', { name: /user settings/i });

      expect(bioLink).toHaveAttribute('href', '/user/bio');
      expect(settingsLink).toHaveAttribute('href', '/user/settings');
    });

    it('handles logout process', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      render(
        <SessionProvider>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      const logoutButton = screen.getByText(/logout/i);
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/signout', {
          method: 'POST',
          headers: { 'Content-Type': 'plain/text' },
        });
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to window resize events', () => {
      const { rerender } = render(
        <SessionProvider>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </SessionProvider>
      );

      // Initially mobile viewport
      expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      fireEvent(window, new Event('resize'));

      // Should still work after resize
      expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();
    });
  });
});
