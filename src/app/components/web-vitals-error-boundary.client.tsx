'use client';

import React, { Component, ReactNode } from 'react';
import { clientLogger } from '@/app/lib/logging/logger.client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorCount: number;
}

export class WebVitalsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    clientLogger.error('Web Vitals Error Boundary caught an error', error, errorInfo);

    this.setState(prevState => ({ 
      errorCount: prevState.errorCount + 1 
    }));

    // Disable Web Vitals after too many errors
    if (this.state.errorCount > 3) {
      clientLogger.warn('Disabling Web Vitals due to repeated errors');
      return;
    }

    // Reset error state after a delay to allow retry
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 5000);
  }

  render() {
    if (this.state.hasError && this.state.errorCount <= 3) {
      // Return null to not render anything, but don't crash the app
      return null;
    }

    return this.props.children;
  }
}