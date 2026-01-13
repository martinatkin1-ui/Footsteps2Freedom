
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorDisplay from './ErrorDisplay';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary to catch and handle runtime errors in the component tree.
 * Inherits from Component to provide error tracking state and lifecycle methods.
 */
/* Fix: Using Component directly ensures inheritance of typed members like setState and props. */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Initialize state property
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  // Update state so the next render will show the fallback UI
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Catch error and report to console
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  /**
   * Resets the error boundary state to allow re-rendering the children.
   */
  handleReset = (): void => {
    // Resetting the state using the inherited setState method
    /* Fix: this.setState is now correctly inherited from the Component base class. */
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    // Access state from the instance
    const { hasError, error } = this.state;
    // Access props from the instance
    /* Fix: this.props is now correctly inherited from the Component base class. */
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <ErrorDisplay error={error || 'Unknown Error'} resetErrorBoundary={this.handleReset} />
        </div>
      );
    }

    return (children as ReactNode) || null;
  }
}

export default ErrorBoundary;
