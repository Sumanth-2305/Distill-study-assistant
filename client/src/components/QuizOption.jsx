import "./QuizOption.css";

export function QuizOption({ option, isSelected, isLocked, isCorrect, onSelect }) {
  let stateClass = "";
  if (isLocked && isSelected) {
    stateClass = isCorrect ? "quiz-option--correct" : "quiz-option--incorrect";
  }

  return (
    <button
      type="button"
      className={`quiz-option ${stateClass}`}
      onClick={() => onSelect(option.id)}
      disabled={isLocked}
      aria-pressed={isSelected}
    >
      <span className="quiz-option__text">{option.text}</span>
      {isLocked && isSelected && (
        <span className="quiz-option__result">
          {isCorrect ? (
            <>
              <span aria-hidden="true">✓</span> Correct
            </>
          ) : (
            <>
              <span aria-hidden="true">✗</span> Incorrect
            </>
          )}
        </span>
      )}
    </button>
  );
}
