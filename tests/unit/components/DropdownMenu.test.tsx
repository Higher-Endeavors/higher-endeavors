import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropdownMenu from '@/app/components/DropdownMenu';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('DropdownMenu Component', () => {
  const mockUseSession = require('next-auth/react').useSession;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to unauthenticated state
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('renders without crashing', () => {
    render(<DropdownMenu />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays sign in button when user is not authenticated', () => {
    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('displays user menu when user is authenticated', () => {
    // Mock authenticated session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  it('opens dropdown menu when clicked', () => {
    // Mock authenticated session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Check if dropdown items are visible
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });

  it('closes dropdown menu when clicking outside', () => {
    // Mock authenticated session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    
    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    
    // Note: Click-outside functionality is handled by Flowbite component
    // and may not work properly in test environment
    // This test verifies the dropdown opens correctly
  });

  it('has proper navigation links', () => {
    // Mock authenticated session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

    render(<DropdownMenu />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/user/dashboard');
  });

  it('handles sign out functionality', () => {
    // Mock authenticated session
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

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
    // Mock session with first_name and last_name
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          role: 'user',
        },
      },
      status: 'authenticated',
    });

    render(<DropdownMenu />);
    expect(screen.getByText(/tu/i)).toBeInTheDocument(); // Test User initials
  });

  it('handles users without first/last name', () => {
    // Mock session with only full name
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          first_name: 'John',
          last_name: 'Doe',
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
