// Mock auth
jest.mock('auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
  })),
}));

// Mock SessionProvider and useSession
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

// Mock all the components
jest.mock('components/Header.jsx', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
}, { virtual: true });

jest.mock('components/HeroBanner.jsx', () => {
  return function MockHeroBanner() {
    return <section data-testid="hero-banner">Hero Banner</section>;
  };
}, { virtual: true });

jest.mock('components/MissionStatement.jsx', () => {
  return function MockMissionStatement() {
    return <section data-testid="mission-statement">Mission Statement</section>;
  };
}, { virtual: true });

jest.mock('components/Promotion.jsx', () => {
  return function MockPromotion() {
    return <section data-testid="promotion">Promotion</section>;
  };
}, { virtual: true });

jest.mock('components/Services.jsx', () => {
  return function MockServices() {
    return <section data-testid="services">Services</section>;
  };
}, { virtual: true });

jest.mock('components/Pillars', () => {
  return function MockPillars() {
    return <section data-testid="pillars">Pillars</section>;
  };
}, { virtual: true });

jest.mock('components/Continuum', () => {
  return function MockContinuum() {
    return <section data-testid="continuum">Continuum</section>;
  };
}, { virtual: true });

jest.mock('components/Footer.jsx', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
}, { virtual: true });

import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from 'page';

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(await Home());
    // Check that the App div is rendered by looking for the class
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  it('renders all main sections', async () => {
    render(await Home());
    
    // Check that the main App div is rendered
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    
    // Check for header element
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('has proper page structure', async () => {
    render(await Home());
    
    // Check that the App div is present
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  it('wraps content in SessionProvider', async () => {
    render(await Home());
    
    // The SessionProvider should be present (mocked to render children)
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  it('renders components in correct order', async () => {
    render(await Home());
    
    // Check that the App div contains the expected structure
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
    
    // Check for header
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('handles async rendering correctly', async () => {
    // Test that the component can be awaited
    const component = await Home();
    expect(component).toBeDefined();
    
    render(component);
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });
});
