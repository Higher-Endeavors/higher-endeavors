import { renderHook } from '@testing-library/react';
import { useErrorBoundary } from 'lib/hooks/use-error-boundary';

// Mock client logger
jest.mock('lib/logging/logger.client', () => ({
  clientLogger: {
    error: jest.fn(),
  },
}));

describe('useErrorBoundary Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets up error event listener on mount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useErrorBoundary());

    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('logs uncaught errors with proper metadata', () => {
    const { clientLogger } = require('lib/logging/logger.client');
    
    renderHook(() => useErrorBoundary());

    const errorEvent = new ErrorEvent('error', {
      error: new Error('Test error'),
      filename: 'test.js',
      lineno: 10,
      colno: 5,
    });

    // Simulate the error event
    window.dispatchEvent(errorEvent);

    expect(clientLogger.error).toHaveBeenCalledWith(
      'Uncaught error',
      errorEvent.error,
      {
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      },
      'error-boundary'
    );
  });

  it('logs unhandled promise rejections', () => {
    renderHook(() => useErrorBoundary());

    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      reason: new Error('Promise rejection'),
      promise: Promise.reject(new Error('Promise rejection')),
    });

    // Simulate the rejection event
    window.dispatchEvent(rejectionEvent);

    expect(mockClientLogger.error).toHaveBeenCalledWith(
      'Unhandled promise rejection',
      rejectionEvent.reason,
      {},
      'error-boundary'
    );
  });

  it('handles error events without error object', () => {
    renderHook(() => useErrorBoundary());

    const errorEvent = new ErrorEvent('error', {
      filename: 'test.js',
      lineno: 10,
      colno: 5,
    });

    window.dispatchEvent(errorEvent);

    expect(mockClientLogger.error).toHaveBeenCalledWith(
      'Uncaught error',
      undefined,
      {
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      },
      'error-boundary'
    );
  });

  it('handles rejection events without reason', () => {
    renderHook(() => useErrorBoundary());

    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject(),
    });

    window.dispatchEvent(rejectionEvent);

    expect(mockClientLogger.error).toHaveBeenCalledWith(
      'Unhandled promise rejection',
      undefined,
      {},
      'error-boundary'
    );
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useErrorBoundary());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('does not interfere with multiple instances', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    const { unmount: unmount1 } = renderHook(() => useErrorBoundary());
    const { unmount: unmount2 } = renderHook(() => useErrorBoundary());

    // Should have been called twice (once for each instance)
    expect(addEventListenerSpy).toHaveBeenCalledTimes(4); // 2 events × 2 instances

    unmount1();
    unmount2();

    addEventListenerSpy.mockRestore();
  });
});
