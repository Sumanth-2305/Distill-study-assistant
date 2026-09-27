import { Component } from "react";

import "./ErrorBoundary.css";

/**
 * App-wide safety net: catches unexpected render errors so a bug in any one
 * view (a bad render, an unexpected data shape that slipped past validation)
 * can never take down the whole app with a blank white screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unexpected application error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="boundary-fallback">
          <div className="card boundary-fallback__card">
            <h1>Something went wrong</h1>
            <p>The app hit an unexpected error. Reloading usually fixes it.</p>
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
