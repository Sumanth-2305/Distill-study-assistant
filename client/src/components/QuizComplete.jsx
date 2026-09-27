import "./QuizComplete.css";

const CONFETTI_COLORS = ["#6366f1", "#d946ef", "#ec4899", "#8b5cf6", "#22d3ee"];
const CONFETTI_PIECES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 7.3) % 100,
  delay: (i % 7) * 0.12,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotate: (i * 47) % 360,
}));

export function QuizComplete({ totalCount, onStudyAgain, onBackToSummary }) {
  return (
    <div className="card quiz-complete">
      <div className="quiz-complete__confetti" aria-hidden="true">
        {CONFETTI_PIECES.map((piece, i) => (
          <span
            key={i}
            className="quiz-complete__confetti-piece"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              background: piece.color,
              transform: `rotate(${piece.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <span className="quiz-complete__emoji" aria-hidden="true">
        🎉
      </span>
      <h2>Quiz Complete</h2>
      <p className="quiz-complete__score">
        {totalCount} / {totalCount} Mastered
      </p>
      <p className="quiz-complete__message">You successfully answered every question correctly.</p>
      <div className="quiz-complete__actions">
        <button type="button" className="btn btn-primary" onClick={onStudyAgain}>
          Study Again
        </button>
        <button type="button" className="btn btn-secondary" onClick={onBackToSummary}>
          Back to Summary
        </button>
      </div>
    </div>
  );
}
