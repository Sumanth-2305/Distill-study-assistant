import { BreakdownCard } from "./BreakdownCard";
import { Flashcard } from "./Flashcard";
import "./SummaryView.css";

export function SummaryView({ topic, summary, breakdown, flashcards, onGoToQuiz }) {
  return (
    <div className="container summary-view">
      <div className="card summary-view__summary enter-fade-up">
        <p className="summary-view__eyebrow">{topic}</p>
        <p className="summary-view__text">{summary}</p>
      </div>

      <div className="summary-view__breakdown">
        {breakdown.map((section, index) => (
          <BreakdownCard
            key={section.id}
            index={index}
            heading={section.heading}
            content={section.content}
          />
        ))}
      </div>

      <h2 className="summary-view__section-label">Flashcards</h2>
      <div className="summary-view__flashcards">
        {flashcards.map((card) => (
          <Flashcard key={card.id} question={card.question} answer={card.answer} />
        ))}
      </div>

      <div className="summary-view__actions">
        <button type="button" className="btn btn-primary" onClick={onGoToQuiz}>
          Go to Quiz
        </button>
      </div>
    </div>
  );
}
