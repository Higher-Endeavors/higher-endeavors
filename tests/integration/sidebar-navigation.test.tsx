import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import UserSidebar from '(protected)/components/UserSidebar';
import { UserSettingsProvider } from 'context/UserSettingsContext';

// Mock next-auth
const mockUseSession = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return React.createElement('a', { href }, children);
  };
}, { virtual: true });

// Create a test wrapper with UserSettingsProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const mockUserSettings = {
    general: {
      sidebarExpandMode: 'hover' as const,
    },
  };

  return (
    <UserSettingsProvider userSettings={mockUserSettings}>
      {children}
    </UserSettingsProvider>
  );
};

// Mock client utilities
jest.mock('lib/utils/clientUtils', () => ({
  getFetchBaseUrl: jest.fn(() => Promise.resolve('http://localhost:3000')),
}), { virtual: true });

// Mock client logger
jest.mock('lib/logging/logger.client', () => ({
  clientLogger: {
    error: jest.fn(),
  },
}), { virtual: true });

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

    // Mock matchMedia for desktop detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(min-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Desktop Navigation Flow', () => {
    it('expands sidebar on hover in hover mode', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const sidebar = screen.getByRole('navigation').closest('div');
      fireEvent.mouseEnter(sidebar!);

      expect(mockSetExpanded).toHaveBeenCalledWith(true);
    });

    it('collapses sidebar on mouse leave in hover mode', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const sidebar = screen.getByRole('navigation').closest('div');
      fireEvent.mouseLeave(sidebar!);

      expect(mockSetExpanded).toHaveBeenCalledWith(false);
    });

    it('expands sidebar on click in click mode', () => {
      // Update the TestWrapper to use click mode
      const ClickModeWrapper = ({ children }: { children: React.ReactNode }) => {
        const mockUserSettings = {
          general: {
            sidebarExpandMode: 'click' as const,
          },
        };

        return (
          <UserSettingsProvider userSettings={mockUserSettings}>
            {children}
          </UserSettingsProvider>
        );
      };

      render(
        <ClickModeWrapper>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </ClickModeWrapper>
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

      // Mock matchMedia for mobile detection
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(min-width: 768px)' ? false : true,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('shows hamburger menu when sidebar is collapsed', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });

    it('opens sidebar when hamburger menu is clicked', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const hamburgerButton = screen.getByRole('button', { name: /expand sidebar/i });
      fireEvent.click(hamburgerButton);

      expect(mockSetExpanded).toHaveBeenCalledWith(true);
    });

    it('shows backdrop when sidebar is open', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-40');
      expect(backdrop).toBeInTheDocument();
    });

    it('closes sidebar when backdrop is clicked', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-40');
      fireEvent.click(backdrop!);

      expect(mockSetExpanded).toHaveBeenCalledWith(false);
    });
  });

  describe('Section Navigation Flow', () => {
    it('expands lifestyle section and shows sub-links', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const lifestyleButton = screen.getByText(/lifestyle/i);
      fireEvent.click(lifestyleButton);

      expect(screen.getByText(/goal tracker/i)).toBeInTheDocument();
      expect(screen.getByText(/sleep quality assessment/i)).toBeInTheDocument();
    });

    it('expands health section and shows sub-links', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const healthButton = screen.getByText(/health/i);
      fireEvent.click(healthButton);

      expect(screen.getByText(/breathing/i)).toBeInTheDocument();
      expect(screen.getByText(/body composition tracker/i)).toBeInTheDocument();
    });

    it('expands nutrition section and shows sub-links', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const nutritionButton = screen.getByText(/nutrition/i);
      fireEvent.click(nutritionButton);

      expect(screen.getByText(/nutrition tracker/i)).toBeInTheDocument();
    });

    it('expands fitness section and shows sub-links', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
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
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
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
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      expect(screen.getByText('TU')).toBeInTheDocument(); // Test User initials
    });

    it('displays user full name when expanded', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('provides access to user bio and settings', () => {
      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      const links = screen.getAllByRole('link', { name: '' });
      const bioLink = links.find(link => link.getAttribute('href') === '/user/bio');
      const settingsLink = links.find(link => link.getAttribute('href') === '/user/settings');

      expect(bioLink).toHaveAttribute('href', '/user/bio');
      expect(settingsLink).toHaveAttribute('href', '/user/settings');
    });

    it('handles logout process', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      render(
        <TestWrapper>
          <UserSidebar expanded={true} setExpanded={mockSetExpanded} />
        </TestWrapper>
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
        <TestWrapper>
          <UserSidebar expanded={false} setExpanded={mockSetExpanded} />
        </TestWrapper>
      );

      // Initially mobile viewport
      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      fireEvent(window, new Event('resize'));

      // Should still work after resize
      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });
  });
});
