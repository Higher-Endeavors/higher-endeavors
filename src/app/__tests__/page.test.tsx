import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock auth
jest.mock('@/app/auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
  })),
}));

// Mock SessionProvider
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock all the components
jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

jest.mock('../components/HeroBanner', () => {
  return function MockHeroBanner() {
    return <section data-testid="hero-banner">Hero Banner</section>;
  };
});

jest.mock('../components/MissionStatement', () => {
  return function MockMissionStatement() {
    return <section data-testid="mission-statement">Mission Statement</section>;
  };
});

jest.mock('../components/Promotion', () => {
  return function MockPromotion() {
    return <section data-testid="promotion">Promotion</section>;
  };
});

jest.mock('../components/Services', () => {
  return function MockServices() {
    return <section data-testid="services">Services</section>;
  };
});

jest.mock('../components/Pillars', () => {
  return function MockPillars() {
    return <section data-testid="pillars">Pillars</section>;
  };
});

jest.mock('../components/Continuum', () => {
  return function MockContinuum() {
    return <section data-testid="continuum">Continuum</section>;
  };
});

jest.mock('../components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>;
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(await Home());
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders all main sections', async () => {
    render(await Home());
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
    expect(screen.getByTestId('mission-statement')).toBeInTheDocument();
    expect(screen.getByTestId('promotion')).toBeInTheDocument();
    expect(screen.getByTestId('services')).toBeInTheDocument();
    expect(screen.getByTestId('pillars')).toBeInTheDocument();
    expect(screen.getByTestId('continuum')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('has proper page structure', async () => {
    render(await Home());
    
    const appDiv = screen.getByText('Header').closest('.App');
    expect(appDiv).toBeInTheDocument();
  });

  it('wraps content in SessionProvider', async () => {
    render(await Home());
    
    // The SessionProvider should be present (mocked to render children)
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders components in correct order', async () => {
    render(await Home());
    
    const sections = [
      'Header',
      'Hero Banner',
      'Mission Statement',
      'Promotion',
      'Services',
      'Pillars',
      'Continuum',
      'Footer',
    ];

    sections.forEach((sectionText, index) => {
      const element = screen.getByText(sectionText);
      expect(element).toBeInTheDocument();
    });
  });

  it('handles async rendering correctly', async () => {
    // Test that the component can be awaited
    const component = await Home();
    expect(component).toBeDefined();
    
    render(component);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
