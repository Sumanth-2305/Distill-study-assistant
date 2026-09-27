import { useState } from "react";

import { AppShell } from "./components/AppShell";
import { ErrorView } from "./components/ErrorView";
import { HomeInput } from "./components/HomeInput";
import { LoadingView } from "./components/LoadingView";
import { QuizView } from "./components/QuizView";
import { ResultsChoice } from "./components/ResultsChoice";
import { SummaryView } from "./components/SummaryView";
import { useGenerateLearningContent } from "./hooks/useGenerateLearningContent";

function App() {
  const { status, aiData, errorMessage, generate, retry } = useGenerateLearningContent();

  // Navigation state is kept separate from the AI request state (status/aiData/
  // errorMessage, owned by the hook). Each navigation action sets these
  // explicitly, so rendering never needs to "sync" from one to the other.
  const [showInput, setShowInput] = useState(true);
  const [screen, setScreen] = useState("choice"); // 'choice' | 'summary' | 'quiz'
  const [viewingPreviousResult, setViewingPreviousResult] = useState(false);

  function handleGenerate(text) {
    setShowInput(false);
    setScreen("choice");
    setViewingPreviousResult(false);
    generate(text);
  }

  function handleRetry() {
    setViewingPreviousResult(false);
    retry();
  }

  let content;

  // `showInput` is checked first so "New Topic" always escapes whatever the
  // request state is doing (including a lingering error), and `handleGenerate`
  // always flips it back to false before a request starts, so it never
  // shadows the loading/success/error states of an in-flight request.
  if (showInput) {
    content = <HomeInput onSubmit={handleGenerate} />;
  } else if (status === "loading") {
    content = <LoadingView />;
  } else if (status === "error" && !viewingPreviousResult) {
    content = (
      <ErrorView
        message={errorMessage}
        onRetry={handleRetry}
        hasPreviousResult={Boolean(aiData)}
        onBackToPreviousResult={() => setViewingPreviousResult(true)}
      />
    );
  } else if (!aiData) {
    content = <HomeInput onSubmit={handleGenerate} />;
  } else if (screen === "summary") {
    content = (
      <SummaryView
        topic={aiData.topic}
        summary={aiData.summary}
        breakdown={aiData.breakdown}
        flashcards={aiData.flashcards}
        onGoToQuiz={() => setScreen("quiz")}
      />
    );
  } else if (screen === "quiz") {
    content = <QuizView quiz={aiData.quiz} onBackToSummary={() => setScreen("summary")} />;
  } else {
    content = (
      <ResultsChoice
        topic={aiData.topic}
        onViewSummary={() => setScreen("summary")}
        onGoToQuiz={() => setScreen("quiz")}
      />
    );
  }

  const showNewTopic = !showInput && status !== "loading";

  return (
    <AppShell showNewTopic={showNewTopic} onNewTopic={() => setShowInput(true)}>
      {content}
    </AppShell>
  );
}

export default App;
