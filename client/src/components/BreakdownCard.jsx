import "./BreakdownCard.css";

export function BreakdownCard({ index, heading, content }) {
  return (
    <div className="breakdown-card enter-fade-up" style={{ "--enter-delay": `${index * 80}ms` }}>
      <span className="breakdown-card__index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="breakdown-card__body">
        <h3 className="breakdown-card__heading">{heading}</h3>
        <p className="breakdown-card__content">{content}</p>
      </div>
    </div>
  );
}
