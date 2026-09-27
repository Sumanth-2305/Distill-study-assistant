import "./AppShell.css";

export function AppShell({ showNewTopic, onNewTopic, children }) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="container app-shell__header-inner">
          <span className="app-shell__brand">Distill</span>
          {showNewTopic && (
            <button type="button" className="app-shell__new-topic" onClick={onNewTopic}>
              New topic
            </button>
          )}
        </div>
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
