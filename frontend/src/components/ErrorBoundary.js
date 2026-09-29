import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F9FAFB',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: '100%',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              textAlign: 'center',
            }}
          >
            <h1
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.5rem',
                color: '#111827',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                margin: '0 0 1.5rem',
                color: '#6B7280',
                lineHeight: 1.6,
              }}
            >
              Mecac encountered an unexpected error. Please reload the page or return to the home page.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                padding: '0.85rem 1.5rem',
                background: '#2E7D32',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reload Mecac
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;