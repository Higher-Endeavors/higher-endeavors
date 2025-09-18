import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../Header';

// Mock the Logo component
jest.mock('../../../public/Logo.js', () => {
  return function MockLogo({ className }: { className?: string }) {
    return <div data-testid="logo" className={className}>Logo</div>;
  };
}, { virtual: true });

// Mock the DropdownMenu component
jest.mock('../DropdownMenu', () => {
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
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('displays the logo with correct styling', () => {
    render(<Header />);
    const logo = screen.getByTestId('logo');
    expect(logo).toHaveClass('w-full', 'h-auto', 'max-w-[400px]', 'md:max-w-[400px]', 'lg:max-w-[400px]');
  });

  it('renders the dropdown menu', () => {
    render(<Header />);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('contains social media links', () => {
    render(<Header />);
    
    // Check for Instagram link
    const instagramLink = screen.getByRole('link', { name: /instagram/i });
    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/higherendeavors/');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    
    // Check for Facebook link
    const facebookLink = screen.getByRole('link', { name: /facebook/i });
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/higherendeavors');
    expect(facebookLink).toHaveAttribute('target', '_blank');
    
    // Check for Twitter/X link
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/higherendeavors');
    expect(twitterLink).toHaveAttribute('target', '_blank');
  });

  it('has proper header structure and styling', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('px-20', 'py-4', 'flex', 'flex-col', 'md:flex-row', 'sm:flex-row', 'justify-between');
  });

  it('logo link navigates to home page', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: /logo/i });
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
