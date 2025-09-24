import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropdownMenu from 'components/DropdownMenu';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('DropdownMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<DropdownMenu />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays sign in button when user is not authenticated', () => {
    // Mock unauthenticated session
    const mockUseSession = require('next-auth/react').useSession;
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<DropdownMenu />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('displays user menu when user is authenticated', () => {
    render(<DropdownMenu />);
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  it('opens dropdown menu when clicked', () => {
    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Check if dropdown items are visible
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });

  it('closes dropdown menu when clicking outside', () => {
    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    
    // Click outside
    fireEvent.click(document.body);
    
    // Check if dropdown is closed (items should not be visible)
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });

  it('has proper navigation links', () => {
    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/user/dashboard');
  });

  it('handles sign out functionality', () => {
    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const signOutButton = screen.getByText(/sign out/i);
    expect(signOutButton).toBeInTheDocument();
    
    // Test sign out click
    fireEvent.click(signOutButton);
    // Note: Actual sign out functionality would be tested in integration tests
  });

  it('displays user initials when name is available', () => {
    render(<DropdownMenu />);
    expect(screen.getByText(/tu/i)).toBeInTheDocument(); // Test User initials
  });

  it('handles users without first/last name', () => {
    // Mock session with only full name
    const mockUseSession = require('next-auth/react').useSession;
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

    render(<DropdownMenu />);
    expect(screen.getByText(/jd/i)).toBeInTheDocument(); // John Doe initials
  });
});
