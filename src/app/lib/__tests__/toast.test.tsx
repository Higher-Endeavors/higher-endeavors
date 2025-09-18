import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../toast';

// Test component to trigger toasts
function TestComponent() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Success</button>
      <button onClick={() => toast.error('Error message')}>Error</button>
      <button onClick={() => toast.warning('Warning message')}>Warning</button>
      <button onClick={() => toast.info('Info message')}>Info</button>
      <button onClick={() => toast.success('Long message', 10000)}>Long Toast</button>
    </div>
  );
}

// Component to test useToast hook outside provider
function TestComponentWithoutProvider() {
  const toast = useToast();
  return <div>Test</div>;
}

describe('Toast System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders ToastProvider without crashing', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useToast must be used within a ToastProvider');

    console.error = originalError;
  });

  it('displays success toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success');
    fireEvent.click(successButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toHaveClass('border-green-500');
  });

  it('displays error toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const errorButton = screen.getByText('Error');
    fireEvent.click(errorButton);

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toHaveClass('border-red-500');
  });

  it('displays warning toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const warningButton = screen.getByText('Warning');
    fireEvent.click(warningButton);

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toHaveClass('border-yellow-500');
  });

  it('displays info toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const infoButton = screen.getByText('Info');
    fireEvent.click(infoButton);

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toHaveClass('border-blue-500');
  });

  it('auto-removes toast after default duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success');
    fireEvent.click(successButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Fast-forward time by 5 seconds (default duration)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('auto-removes toast after custom duration', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const longToastButton = screen.getByText('Long Toast');
    fireEvent.click(longToastButton);

    expect(screen.getByText('Long message')).toBeInTheDocument();

    // Fast-forward time by 10 seconds (custom duration)
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Long message')).not.toBeInTheDocument();
    });
  });

  it('manually removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success');
    fireEvent.click(successButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('displays multiple toasts simultaneously', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success');
    const errorButton = screen.getByText('Error');

    fireEvent.click(successButton);
    fireEvent.click(errorButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('limits maximum number of toasts', () => {
    render(
      <ToastProvider maxToasts={2}>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success');
    const errorButton = screen.getByText('Error');
    const warningButton = screen.getByText('Warning');

    fireEvent.click(successButton);
    fireEvent.click(errorButton);
    fireEvent.click(warningButton);

    // Only the last 2 toasts should be visible
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success');
    fireEvent.click(successButton);

    const toast = screen.getByText('Success message');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('clears all toasts when clearToasts is called', () => {
    const TestComponentWithClear = () => {
      const toast = useToast();
      return (
        <div>
          <button onClick={() => toast.success('Success')}>Success</button>
          <button onClick={() => toast.error('Error')}>Error</button>
          <button onClick={() => toast.clearToasts()}>Clear All</button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponentWithClear />
      </ToastProvider>
    );

    const successButton = screen.getByText('Success');
    const errorButton = screen.getByText('Error');
    const clearButton = screen.getByText('Clear All');

    fireEvent.click(successButton);
    fireEvent.click(errorButton);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(screen.queryByText('Success')).not.toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('handles toast with zero duration (persistent)', async () => {
    const TestComponentWithPersistent = () => {
      const toast = useToast();
      return (
        <button onClick={() => toast.success('Persistent message', 0)}>
          Persistent Toast
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestComponentWithPersistent />
      </ToastProvider>
    );

    const persistentButton = screen.getByText('Persistent Toast');
    fireEvent.click(persistentButton);

    expect(screen.getByText('Persistent message')).toBeInTheDocument();

    // Fast-forward time - toast should still be there
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Persistent message')).toBeInTheDocument();
  });
});
