import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Mock session for testing
const session = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// Custom render function that includes providers
function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { session };