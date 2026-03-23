import { fetchNui } from '@/utils/fetchNui';
import { Component, ReactNode, ErrorInfo } from 'react';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error.stack || error.message, info);
    this.setState({ hasError: true });

    fetchNui('hideFrame')
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export default ErrorBoundary;
