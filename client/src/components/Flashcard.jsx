import { useState } from "react";

import "./Flashcard.css";

export function Flashcard({ question, answer }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`flashcard ${isFlipped ? "flashcard--flipped" : ""}`}
      onClick={() => setIsFlipped((prev) => !prev)}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `Answer: ${answer}. Press to show question.` : `Question: ${question}. Press to show answer.`}
    >
      <span className="flashcard__inner">
        <span className="flashcard__face flashcard__face--front">
          <span className="flashcard__label">Question</span>
          <span className="flashcard__text">{question}</span>
        </span>
        <span className="flashcard__face flashcard__face--back">
          <span className="flashcard__label">Answer</span>
          <span className="flashcard__text">{answer}</span>
        </span>
      </span>
    </button>
  );
}
