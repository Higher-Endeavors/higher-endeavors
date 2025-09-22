import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '@/app/components/Header';

// Mock the Logo component
jest.mock('public/Logo.js', () => {
  return function MockLogo({ className }: { className?: string }) {
    return <div data-testid="logo" className={className}>Logo</div>;
  };
}, { virtual: true });

// Mock the DropdownMenu component
jest.mock('@/app/components/DropdownMenu', () => {
  return function MockDropdownMenu() {
    return <div data-testid="dropdown-menu">Dropdown Menu</div>;
  };
});

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Header />);
    // Check that the header is rendered
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the logo with correct styling', () => {
    render(<Header />);
    // Find the logo link by href
    const allLinks = screen.getAllByRole('link');
    const logoLink = allLinks.find(link => link.getAttribute('href') === '/');
    expect(logoLink).toBeInTheDocument();
    
    const svg = logoLink?.querySelector('svg');
    expect(svg).toHaveClass('w-full', 'h-auto', 'max-w-[400px]', 'md:max-w-[400px]', 'lg:max-w-[400px]');
  });

  it('renders the dropdown menu', () => {
    render(<Header />);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('contains social media links', () => {
    render(<Header />);
    
    // Get all links and find social media links by href
    const allLinks = screen.getAllByRole('link');
    
    // Check for Instagram link
    const instagram = allLinks.find(link => link.getAttribute('href') === 'https://www.instagram.com/higherendeavors/');
    expect(instagram).toHaveAttribute('href', 'https://www.instagram.com/higherendeavors/');
    expect(instagram).toHaveAttribute('target', '_blank');
    
    // Check for Facebook link
    const facebook = allLinks.find(link => link.getAttribute('href') === 'https://www.facebook.com/higherendeavors');
    expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/higherendeavors');
    expect(facebook).toHaveAttribute('target', '_blank');
    
    // Check for Twitter/X link
    const twitter = allLinks.find(link => link.getAttribute('href') === 'https://x.com/higherendeavors');
    expect(twitter).toHaveAttribute('href', 'https://x.com/higherendeavors');
    expect(twitter).toHaveAttribute('target', '_blank');
  });

  it('has proper header structure and styling', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('px-20', 'py-4', 'flex', 'flex-col', 'md:flex-row', 'sm:flex-row', 'justify-between');
  });

  it('logo link navigates to home page', () => {
    render(<Header />);
    // Find the logo link by href
    const allLinks = screen.getAllByRole('link');
    const logoLink = allLinks.find(link => link.getAttribute('href') === '/');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('social media icons have proper accessibility attributes', () => {
    render(<Header />);
    
    const socialIcons = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('instagram') ||
      link.getAttribute('href')?.includes('facebook') ||
      link.getAttribute('href')?.includes('x.com')
    );
    
    socialIcons.forEach(icon => {
      const svg = icon.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
