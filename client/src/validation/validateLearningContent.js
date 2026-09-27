/**
 * Exhaustive validation for the AI-generated learning content response.
 * Never trust the backend/LLM: this is the single source of truth for whether
 * a response is safe to render. Fails fast on the first problem found and
 * never partially validates/renders.
 *
 * Returns:
 *   { valid: true, data: <cleaned LearningContent> }
 *   { valid: false, reason: <string code> }
 */

const BREAKDOWN_COUNT = 4;
const FLASHCARD_COUNT = 2;
const QUIZ_COUNT = 5;
const OPTION_COUNT = 4;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(reason) {
  return { valid: false, reason };
}

function validateBreakdownSection(section) {
  if (!isPlainObject(section)) return "INVALID_BREAKDOWN_FIELDS";
  if (!isNonEmptyString(section.id)) return "INVALID_BREAKDOWN_FIELDS";
  if (!isNonEmptyString(section.heading)) return "INVALID_BREAKDOWN_FIELDS";
  if (!isNonEmptyString(section.content)) return "INVALID_BREAKDOWN_FIELDS";
  return null;
}

function validateFlashcard(card) {
  if (!isPlainObject(card)) return "INVALID_FLASHCARD_FIELDS";
  if (!isNonEmptyString(card.id)) return "INVALID_FLASHCARD_FIELDS";
  if (!isNonEmptyString(card.question)) return "INVALID_FLASHCARD_FIELDS";
  if (!isNonEmptyString(card.answer)) return "INVALID_FLASHCARD_FIELDS";
  return null;
}

function validateOption(option) {
  if (!isPlainObject(option)) return "INVALID_OPTION_FIELDS";
  if (!isNonEmptyString(option.id)) return "INVALID_OPTION_FIELDS";
  if (!isNonEmptyString(option.text)) return "INVALID_OPTION_FIELDS";
  return null;
}

function validateQuestion(question) {
  if (!isPlainObject(question)) return "INVALID_QUESTION_FIELDS";
  if (!isNonEmptyString(question.id)) return "INVALID_QUESTION_FIELDS";
  if (!isNonEmptyString(question.question)) return "INVALID_QUESTION_FIELDS";
  if (!isNonEmptyString(question.explanation)) return "INVALID_QUESTION_FIELDS";

  if (!Array.isArray(question.options)) return "INVALID_OPTIONS_TYPE";
  if (question.options.length !== OPTION_COUNT) return "WRONG_OPTION_COUNT";

  for (const option of question.options) {
    const optionError = validateOption(option);
    if (optionError) return optionError;
  }

  const optionIds = question.options.map((option) => option.id.trim());
  if (new Set(optionIds).size !== optionIds.length) return "DUPLICATE_OPTION_ID";

  if (!isNonEmptyString(question.correct_answer)) return "MISSING_CORRECT_ANSWER";
  if (!optionIds.includes(question.correct_answer.trim())) {
    return "CORRECT_ANSWER_NOT_IN_OPTIONS";
  }

  return null;
}

export function validateLearningContent(raw) {
  if (!isPlainObject(raw)) return fail("EMPTY_RESPONSE");

  if (!isNonEmptyString(raw.topic)) return fail("INVALID_TOPIC");
  if (!isNonEmptyString(raw.summary)) return fail("INVALID_SUMMARY");

  if (!Array.isArray(raw.breakdown)) return fail("INVALID_BREAKDOWN_TYPE");
  if (raw.breakdown.length !== BREAKDOWN_COUNT) return fail("WRONG_BREAKDOWN_COUNT");

  for (const section of raw.breakdown) {
    const sectionError = validateBreakdownSection(section);
    if (sectionError) return fail(sectionError);
  }

  const breakdownIds = raw.breakdown.map((section) => section.id.trim());
  if (new Set(breakdownIds).size !== breakdownIds.length) {
    return fail("DUPLICATE_BREAKDOWN_ID");
  }

  if (!Array.isArray(raw.flashcards)) return fail("INVALID_FLASHCARDS_TYPE");
  if (raw.flashcards.length !== FLASHCARD_COUNT) return fail("WRONG_FLASHCARD_COUNT");

  for (const card of raw.flashcards) {
    const cardError = validateFlashcard(card);
    if (cardError) return fail(cardError);
  }

  const flashcardIds = raw.flashcards.map((card) => card.id.trim());
  if (new Set(flashcardIds).size !== flashcardIds.length) {
    return fail("DUPLICATE_FLASHCARD_ID");
  }

  if (!Array.isArray(raw.quiz)) return fail("INVALID_QUIZ_TYPE");
  if (raw.quiz.length !== QUIZ_COUNT) return fail("WRONG_QUIZ_COUNT");

  for (const question of raw.quiz) {
    const questionError = validateQuestion(question);
    if (questionError) return fail(questionError);
  }

  const questionIds = raw.quiz.map((question) => question.id.trim());
  if (new Set(questionIds).size !== questionIds.length) {
    return fail("DUPLICATE_QUESTION_ID");
  }

  const cleaned = {
    topic: raw.topic.trim(),
    summary: raw.summary.trim(),
    breakdown: raw.breakdown.map((section) => ({
      id: section.id.trim(),
      heading: section.heading.trim(),
      content: section.content.trim(),
    })),
    flashcards: raw.flashcards.map((card) => ({
      id: card.id.trim(),
      question: card.question.trim(),
      answer: card.answer.trim(),
    })),
    quiz: raw.quiz.map((question) => ({
      id: question.id.trim(),
      question: question.question.trim(),
      explanation: question.explanation.trim(),
      correct_answer: question.correct_answer.trim(),
      options: question.options.map((option) => ({
        id: option.id.trim(),
        text: option.text.trim(),
      })),
    })),
  };

  return { valid: true, data: cleaned };
}
