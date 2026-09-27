const DEFAULT_MESSAGE =
  "Something went wrong while generating your breakdown. Please try again.";

const MESSAGES_BY_REASON = {
  EMPTY_RESPONSE: DEFAULT_MESSAGE,
  INVALID_TOPIC: DEFAULT_MESSAGE,
  INVALID_SUMMARY: DEFAULT_MESSAGE,
  INVALID_BREAKDOWN_TYPE: DEFAULT_MESSAGE,
  WRONG_BREAKDOWN_COUNT: DEFAULT_MESSAGE,
  INVALID_BREAKDOWN_FIELDS: DEFAULT_MESSAGE,
  DUPLICATE_BREAKDOWN_ID: DEFAULT_MESSAGE,
  INVALID_FLASHCARDS_TYPE: DEFAULT_MESSAGE,
  WRONG_FLASHCARD_COUNT: DEFAULT_MESSAGE,
  INVALID_FLASHCARD_FIELDS: DEFAULT_MESSAGE,
  DUPLICATE_FLASHCARD_ID: DEFAULT_MESSAGE,
  INVALID_QUIZ_TYPE: "Unable to generate the quiz right now. Please try again.",
  WRONG_QUIZ_COUNT: "Unable to generate the quiz right now. Please try again.",
  DUPLICATE_QUESTION_ID: "Unable to generate the quiz right now. Please try again.",
  INVALID_QUESTION_FIELDS: "Unable to generate the quiz right now. Please try again.",
  INVALID_OPTIONS_TYPE: "Unable to generate the quiz right now. Please try again.",
  WRONG_OPTION_COUNT: "Unable to generate the quiz right now. Please try again.",
  INVALID_OPTION_FIELDS: "Unable to generate the quiz right now. Please try again.",
  DUPLICATE_OPTION_ID: "Unable to generate the quiz right now. Please try again.",
  MISSING_CORRECT_ANSWER: "Unable to generate the quiz right now. Please try again.",
  CORRECT_ANSWER_NOT_IN_OPTIONS: "Unable to generate the quiz right now. Please try again.",
};

export function getFriendlyErrorMessage(reason) {
  return MESSAGES_BY_REASON[reason] || DEFAULT_MESSAGE;
}
