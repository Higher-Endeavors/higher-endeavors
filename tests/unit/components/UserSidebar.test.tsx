import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserSidebar from '@/app/(protected)/components/UserSidebar';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
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
  })),
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

describe('UserSidebar Component', () => {
  const mockSetExpanded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders without crashing', () => {
    render(<UserSidebar expanded={false} setExpanded={mockSetExpanded} />);
    expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();
  });

  it('displays user initials when expanded', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    expect(screen.getByText('TU')).toBeInTheDocument(); // Test User initials
  });

  it('shows user name when expanded', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('displays navigation links when expanded', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/guide to your ideal self/i)).toBeInTheDocument();
    expect(screen.getByText(/lifestyle/i)).toBeInTheDocument();
    expect(screen.getByText(/health/i)).toBeInTheDocument();
    expect(screen.getByText(/nutrition/i)).toBeInTheDocument();
    expect(screen.getByText(/fitness/i)).toBeInTheDocument();
  });

  it('expands lifestyle section when clicked', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    
    const lifestyleButton = screen.getByText(/lifestyle/i);
    fireEvent.click(lifestyleButton);
    
    expect(screen.getByText(/goal tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/sleep quality assessment/i)).toBeInTheDocument();
  });

  it('expands health section when clicked', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    
    const healthButton = screen.getByText(/health/i);
    fireEvent.click(healthButton);
    
    expect(screen.getByText(/breathing/i)).toBeInTheDocument();
    expect(screen.getByText(/body composition tracker/i)).toBeInTheDocument();
  });

  it('expands nutrition section when clicked', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    
    const nutritionButton = screen.getByText(/nutrition/i);
    fireEvent.click(nutritionButton);
    
    expect(screen.getByText(/nutrition tracker/i)).toBeInTheDocument();
  });

  it('expands fitness section when clicked', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    
    const fitnessButton = screen.getByText(/fitness/i);
    fireEvent.click(fitnessButton);
    
    expect(screen.getByText(/fitness planning/i)).toBeInTheDocument();
    expect(screen.getByText(/resistance training/i)).toBeInTheDocument();
    expect(screen.getByText(/cardiometabolic endurance training/i)).toBeInTheDocument();
    expect(screen.getByText(/structural balance/i)).toBeInTheDocument();
  });

  it('handles logout functionality', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;
    
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'plain/text' },
      });
    });
  });

  it('shows hamburger menu on mobile when collapsed', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    render(<UserSidebar expanded={false} setExpanded={mockSetExpanded} />);
    expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();
  });

  it('handles mobile sidebar toggle', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    
    render(<UserSidebar expanded={false} setExpanded={mockSetExpanded} />);
    
    const hamburgerButton = screen.getByRole('button', { name: /open sidebar/i });
    fireEvent.click(hamburgerButton);
    
    expect(mockSetExpanded).toHaveBeenCalledWith(true);
  });

  it('displays user bio and settings buttons when expanded', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    
    // Find the bio and settings links by their href attributes
    const allLinks = screen.getAllByRole('link');
    const bioLink = allLinks.find(link => 
      link.getAttribute('href') === '/user/bio'
    );
    const settingsLink = allLinks.find(link => 
      link.getAttribute('href') === '/user/settings'
    );
    
    expect(bioLink).toBeInTheDocument();
    expect(bioLink).toHaveAttribute('href', '/user/bio');
    expect(settingsLink).toBeInTheDocument();
    expect(settingsLink).toHaveAttribute('href', '/user/settings');
  });

  it('handles desktop hover mode', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    // Mock matchMedia for desktop
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
    
    render(<UserSidebar expanded={false} setExpanded={mockSetExpanded} />);
    
    const sidebar = screen.getByRole('navigation').closest('div');
    fireEvent.mouseEnter(sidebar!);
    
    expect(mockSetExpanded).toHaveBeenCalledWith(true);
  });

  it('handles desktop click mode', () => {
    // Mock click mode
    const mockUseUserSettings = require('@/app/context/UserSettingsContext').useUserSettings;
    mockUseUserSettings.mockReturnValue({
      userSettings: {
        general: {
          sidebarExpandMode: 'click',
        },
      },
    });
    
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    // Mock matchMedia for desktop
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
    
    render(<UserSidebar expanded={false} setExpanded={mockSetExpanded} />);
    
    const avatar = screen.getByText('TU');
    fireEvent.click(avatar);
    
    expect(mockSetExpanded).toHaveBeenCalledWith(true);
  });

  it('closes all sections when collapsing sidebar', () => {
    render(<UserSidebar expanded={true} setExpanded={mockSetExpanded} />);
    
    // Expand a section first
    const lifestyleButton = screen.getByText(/lifestyle/i);
    fireEvent.click(lifestyleButton);
    expect(screen.getByText(/goal tracker/i)).toBeInTheDocument();
    
    // Click collapse button - find the button with aria-label "Collapse sidebar" that's not a sub-link
    const allButtons = screen.getAllByRole('button');
    const collapseButton = allButtons.find(button => 
      button.getAttribute('aria-label') === 'Collapse sidebar'
    );
    
    expect(collapseButton).toBeInTheDocument();
    fireEvent.click(collapseButton!);
    
    expect(mockSetExpanded).toHaveBeenCalledWith(false);
  });
});
