import { useMemo, useState } from "react";

import { QuizComplete } from "./QuizComplete";
import { QuizProgress } from "./QuizProgress";
import { QuizQuestion } from "./QuizQuestion";
import "./QuizView.css";

function createInitialState(quiz) {
  return {
    phase: "initial", // 'initial' | 'retry'
    initialIndex: 0,
    currentQuestionId: quiz[0].id,
    retryQueue: [], // FIFO array of question ids awaiting a correct retry
    masteredIds: new Set(), // question ids answered correctly at least once
    selectedOptionId: null,
    isLocked: false,
    isComplete: false,
  };
}

export function QuizView({ quiz, onBackToSummary }) {
  const [state, setState] = useState(() => createInitialState(quiz));

  const questionsById = useMemo(() => {
    const map = new Map();
    quiz.forEach((question) => map.set(question.id, question));
    return map;
  }, [quiz]);

  function handleSelectOption(optionId) {
    if (state.isLocked) return;

    setState((prev) => {
      const currentQuestion = questionsById.get(prev.currentQuestionId);
      const isCorrect = optionId === currentQuestion.correct_answer;

      const masteredIds = new Set(prev.masteredIds);
      let retryQueue = prev.retryQueue;

      if (isCorrect) {
        masteredIds.add(currentQuestion.id);
        if (prev.phase === "retry") {
          retryQueue = retryQueue.filter((id) => id !== currentQuestion.id);
        }
      } else if (prev.phase === "initial") {
        retryQueue = [...retryQueue, currentQuestion.id];
      } else {
        // Wrong again on retry: keep cycling — move to the back of the queue.
        retryQueue = [...retryQueue.filter((id) => id !== currentQuestion.id), currentQuestion.id];
      }

      // currentQuestionId deliberately stays put here: the same question keeps
      // showing (locked, with its result) until Next is clicked, even though
      // retryQueue may have already changed as a result of this answer.
      return { ...prev, selectedOptionId: optionId, isLocked: true, masteredIds, retryQueue };
    });
  }

  function handleNext() {
    setState((prev) => {
      if (!prev.isLocked) return prev;

      if (prev.phase === "initial" && prev.initialIndex < quiz.length - 1) {
        const initialIndex = prev.initialIndex + 1;
        return {
          ...prev,
          initialIndex,
          currentQuestionId: quiz[initialIndex].id,
          selectedOptionId: null,
          isLocked: false,
        };
      }

      const isDone = prev.retryQueue.length === 0 && prev.masteredIds.size === quiz.length;
      if (isDone) {
        return { ...prev, phase: "retry", isComplete: true, selectedOptionId: null, isLocked: false };
      }

      return {
        ...prev,
        phase: "retry",
        currentQuestionId: prev.retryQueue[0],
        selectedOptionId: null,
        isLocked: false,
      };
    });
  }

  function handleStudyAgain() {
    setState(createInitialState(quiz));
  }

  function handleBackToSummary() {
    setState(createInitialState(quiz));
    onBackToSummary();
  }

  if (state.isComplete) {
    return (
      <div className="container quiz-view">
        <QuizComplete
          totalCount={quiz.length}
          onStudyAgain={handleStudyAgain}
          onBackToSummary={handleBackToSummary}
        />
      </div>
    );
  }

  const currentQuestion = questionsById.get(state.currentQuestionId);

  return (
    <div className="container quiz-view">
      <QuizProgress
        phase={state.phase}
        initialIndex={state.initialIndex}
        totalCount={quiz.length}
        masteredCount={state.masteredIds.size}
        retryRemaining={state.retryQueue.length}
      />
      <QuizQuestion
        key={currentQuestion.id}
        question={currentQuestion}
        selectedOptionId={state.selectedOptionId}
        isLocked={state.isLocked}
        onSelectOption={handleSelectOption}
        onNext={handleNext}
      />
    </div>
  );
}
