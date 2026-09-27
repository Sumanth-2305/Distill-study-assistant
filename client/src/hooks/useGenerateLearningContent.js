import { useCallback, useRef, useState } from "react";

import { generateLearningContent } from "../api/generateLearningContent";
import { getFriendlyErrorMessage } from "../validation/errorMessages";
import { validateLearningContent } from "../validation/validateLearningContent";

/**
 * Owns the full request lifecycle for generating learning content, including
 * protection against stale/out-of-order responses: only the resolution of the
 * most recently started request is ever allowed to update state. A previously
 * valid `aiData` is never cleared by a later failure, so it stays available
 * even while the view is showing an error.
 */
export function useGenerateLearningContent() {
  const requestIdRef = useRef(0);
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [aiData, setAiData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastInput, setLastInput] = useState("");

  const generate = useCallback(async (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const thisRequestId = ++requestIdRef.current;
    setLastInput(trimmed);
    setStatus("loading");
    setErrorMessage(null);

    const result = await generateLearningContent(trimmed);

    if (thisRequestId !== requestIdRef.current) {
      // A newer request has since started; this resolution is stale, discard it.
      return;
    }

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    const validation = validateLearningContent(result.data);
    if (!validation.valid) {
      setStatus("error");
      setErrorMessage(getFriendlyErrorMessage(validation.reason));
      return;
    }

    setAiData(validation.data);
    setStatus("success");
  }, []);

  const retry = useCallback(() => {
    if (lastInput) generate(lastInput);
  }, [generate, lastInput]);

  return { status, aiData, errorMessage, generate, retry };
}
