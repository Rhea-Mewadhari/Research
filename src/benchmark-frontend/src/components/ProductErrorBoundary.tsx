import { Component, type ReactNode } from 'react';
import { useProductContext } from '../context/ProductContext';

interface InnerProps {
  children: ReactNode;
  onRetry: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ProductErrorBoundaryInner extends Component<InnerProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-boundary">
          <p>Something went wrong loading products.</p>
          {this.state.error && (
            <p className="error-message">{this.state.error.message}</p>
          )}
          <button type="button" onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProductErrorBoundary({ children }: { children: ReactNode }) {
  const { refresh } = useProductContext();
  return (
    <ProductErrorBoundaryInner onRetry={refresh}>{children}</ProductErrorBoundaryInner>
  );
}
