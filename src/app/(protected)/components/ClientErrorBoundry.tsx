'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { clientLogger } from '@/app/lib/logging/client-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    clientLogger.error('React error boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    }, 'react-error-boundary');
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }
    
    return this.props.children;
  }
}