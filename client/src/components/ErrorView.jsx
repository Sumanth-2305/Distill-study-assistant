import "./ErrorView.css";

export function ErrorView({ message, onRetry, hasPreviousResult, onBackToPreviousResult }) {
  return (
    <div className="container error-view">
      <div className="card error-view__card" role="alert">
        <span className="error-view__icon" aria-hidden="true">
          ⚠
        </span>
        <h2>We hit a snag</h2>
        <p>{message}</p>
        <div className="error-view__actions">
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            Retry
          </button>
          {hasPreviousResult && (
            <button type="button" className="btn btn-secondary" onClick={onBackToPreviousResult}>
              Back to your last result
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
