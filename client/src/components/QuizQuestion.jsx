import { QuizOption } from "./QuizOption";
import "./QuizQuestion.css";

export function QuizQuestion({ question, selectedOptionId, isLocked, onSelectOption, onNext }) {
  const isCorrect = isLocked && selectedOptionId === question.correct_answer;

  return (
    <div className="card quiz-question enter-fade-up">
      <h2 className="quiz-question__text">{question.question}</h2>

      <div className="quiz-question__options">
        {question.options.map((option) => (
          <QuizOption
            key={option.id}
            option={option}
            isSelected={selectedOptionId === option.id}
            isLocked={isLocked}
            isCorrect={option.id === question.correct_answer}
            onSelect={onSelectOption}
          />
        ))}
      </div>

      {isLocked && isCorrect && (
        <p className="quiz-question__explanation">{question.explanation}</p>
      )}
      {isLocked && !isCorrect && (
        <p className="quiz-question__retry-note">
          Your answer was incorrect. This question will come back for another try.
        </p>
      )}

      <div className="quiz-question__actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!isLocked}
        >
          Next
        </button>
      </div>
    </div>
  );
}
