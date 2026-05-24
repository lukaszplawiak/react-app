import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ErrorBoundary must be a class component — React's componentDidCatch
// and getDerivedStateFromError lifecycle methods have no hook equivalents.
//
// Placed at the root (above <App>) so any unhandled runtime error in the
// component tree shows a graceful fallback instead of a blank screen.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production you'd send this to an error tracking service (Sentry etc.)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback;

      return (
        <div className="ErrorBoundary" role="alert">
          <div className="ErrorBoundary-content">
            <h2 className="ErrorBoundary-title">Something went wrong</h2>
            <p className="ErrorBoundary-message">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {import.meta.env.DEV && error && (
              <pre className="ErrorBoundary-detail">{error.message}</pre>
            )}
            <button
              className="ErrorBoundary-button"
              onClick={this.handleReset}
              type="button"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;