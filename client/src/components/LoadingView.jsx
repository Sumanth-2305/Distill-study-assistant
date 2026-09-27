import "./LoadingView.css";

export function LoadingView() {
  return (
    <div className="container loading-view" role="status" aria-live="polite">
      <p className="loading-view__label">
        Distilling your topic
        <span className="loading-view__dots" aria-hidden="true">
          <span className="loading-view__dot" />
          <span className="loading-view__dot" />
          <span className="loading-view__dot" />
        </span>
      </p>
      <div className="card loading-view__skeleton">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line--short" />
      </div>
      <div className="loading-view__cards">
        <div className="card skeleton-block" />
        <div className="card skeleton-block" />
        <div className="card skeleton-block" />
        <div className="card skeleton-block" />
      </div>
    </div>
  );
}
