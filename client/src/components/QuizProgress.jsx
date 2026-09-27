import "./QuizProgress.css";

export function QuizProgress({ phase, initialIndex, totalCount, masteredCount, retryRemaining }) {
  const percent = Math.round((masteredCount / totalCount) * 100);

  return (
    <div className="quiz-progress">
      <p className="quiz-progress__label" aria-live="polite">
        {phase === "initial" ? (
          <>
            Question {initialIndex + 1} of {totalCount}
          </>
        ) : (
          <>
            Reviewing missed questions — {masteredCount}/{totalCount} mastered ({retryRemaining}{" "}
            remaining)
          </>
        )}
      </p>
      <div
        className="quiz-progress__track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Questions mastered"
      >
        <div className="quiz-progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
