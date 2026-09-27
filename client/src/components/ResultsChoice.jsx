import "./ResultsChoice.css";

export function ResultsChoice({ topic, onViewSummary, onGoToQuiz }) {
  return (
    <div className="container results-choice">
      <p className="results-choice__eyebrow enter-fade-up">Distilled</p>
      <h2 className="results-choice__topic enter-fade-up" style={{ "--enter-delay": "60ms" }}>
        {topic}
      </h2>
      <p className="results-choice__hint enter-fade-up" style={{ "--enter-delay": "120ms" }}>
        Your breakdown is ready. What would you like to do?
      </p>

      <div className="results-choice__actions">
        <button
          type="button"
          className="card results-choice__option enter-fade-up"
          style={{ "--enter-delay": "200ms" }}
          onClick={onViewSummary}
        >
          <span className="results-choice__option-icon" aria-hidden="true">
            📖
          </span>
          <span className="results-choice__option-title">Summary</span>
          <span className="results-choice__option-desc">Breakdown + 2 flashcards</span>
        </button>
        <button
          type="button"
          className="card results-choice__option enter-fade-up"
          style={{ "--enter-delay": "260ms" }}
          onClick={onGoToQuiz}
        >
          <span className="results-choice__option-icon" aria-hidden="true">
            ⚡
          </span>
          <span className="results-choice__option-title">Go to Quiz</span>
          <span className="results-choice__option-desc">Test yourself with 5 questions</span>
        </button>
      </div>
    </div>
  );
}
