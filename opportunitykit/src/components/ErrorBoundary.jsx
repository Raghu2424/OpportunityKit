import { Component } from 'react';

// Last line of defence: a render error shows a recovery screen instead of a blank page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('OpportunityKit crashed:', error, info);
  }

  reset = () => {
    try {
      window.localStorage.removeItem('opportunitykit.profile.v1');
    } catch {
      /* storage unavailable: nothing to clear */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="mx-auto mt-20 max-w-lg rounded-xl border border-rose-300 bg-rose-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-rose-950">The app hit an unexpected error</h1>
        <p className="mt-2 text-rose-900">
          Reload the page to continue. If the error returns, reset the saved demo data. This only clears the profile stored in this browser.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <button type="button" className="btn btn-danger" onClick={this.reset}>
            Reset saved data
          </button>
        </div>
      </div>
    );
  }
}
