"""Gemini SDK integration: prompt, response schema, and the model call itself."""

import json
import os
import re

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-3.5-flash"
MAX_INPUT_LENGTH = 8000

SYSTEM_INSTRUCTION = """You are the content engine behind Distill, an app that turns any
topic or pasted notes into a clear breakdown, flashcards, and a quiz.

You will receive input that is either a short topic name or a longer block of
pasted study notes. Generate content based ONLY on that input:
- If the input looks like pasted notes/material, treat it as the primary
  source of truth. Do not invent facts unrelated to it.
- If the input is a short topic, generate accurate, well-known material about
  that topic.

Return ONLY a single JSON object with exactly this shape and nothing else:

{
  "topic": "string",
  "summary": "string",
  "breakdown": [
    { "id": "b1", "heading": "string", "content": "string" },
    { "id": "b2", "heading": "string", "content": "string" },
    { "id": "b3", "heading": "string", "content": "string" },
    { "id": "b4", "heading": "string", "content": "string" }
  ],
  "flashcards": [
    { "id": "f1", "question": "string", "answer": "string" },
    { "id": "f2", "question": "string", "answer": "string" }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "string",
      "options": [
        { "id": "a", "text": "string" },
        { "id": "b", "text": "string" },
        { "id": "c", "text": "string" },
        { "id": "d", "text": "string" }
      ],
      "correct_answer": "a",
      "explanation": "string"
    }
  ]
}

Strict rules:
- "summary" is a short 1-2 sentence overview of the topic.
- "breakdown" must contain EXACTLY 4 sections, with ids "b1" through "b4".
  Each section covers a genuinely distinct facet of the topic (for example:
  what it is, how it works or its key mechanism, why it matters, and an
  example or common pitfall) — the 4 sections must NOT be paraphrases of the
  same point. Each "heading" is short (2-5 words); each "content" is 1-3
  sentences.
- "flashcards" must contain EXACTLY 2 items, with ids "f1" and "f2".
- "quiz" must contain EXACTLY 5 items, with ids "q1" through "q5".
- Every quiz question must have EXACTLY 4 options, with ids "a", "b", "c", "d".
- Exactly ONE option per question is correct. "correct_answer" must equal the
  id of that correct option (one of "a", "b", "c", "d").
- Every quiz question must include a non-empty "explanation" describing why
  the correct answer is correct.
- Quiz questions must test understanding of the material, not simply repeat
  sentences verbatim from the input.
- Do not add any fields beyond the ones shown above.
- Do not wrap the JSON in markdown code fences.
- Do not include any commentary, preamble, or text outside the JSON object.
"""

LEARNING_CONTENT_SCHEMA = types.Schema(
    type=types.Type.OBJECT,
    required=["topic", "summary", "breakdown", "flashcards", "quiz"],
    properties={
        "topic": types.Schema(type=types.Type.STRING),
        "summary": types.Schema(type=types.Type.STRING),
        "breakdown": types.Schema(
            type=types.Type.ARRAY,
            min_items=4,
            max_items=4,
            items=types.Schema(
                type=types.Type.OBJECT,
                required=["id", "heading", "content"],
                properties={
                    "id": types.Schema(type=types.Type.STRING),
                    "heading": types.Schema(type=types.Type.STRING),
                    "content": types.Schema(type=types.Type.STRING),
                },
            ),
        ),
        "flashcards": types.Schema(
            type=types.Type.ARRAY,
            min_items=2,
            max_items=2,
            items=types.Schema(
                type=types.Type.OBJECT,
                required=["id", "question", "answer"],
                properties={
                    "id": types.Schema(type=types.Type.STRING),
                    "question": types.Schema(type=types.Type.STRING),
                    "answer": types.Schema(type=types.Type.STRING),
                },
            ),
        ),
        "quiz": types.Schema(
            type=types.Type.ARRAY,
            min_items=5,
            max_items=5,
            items=types.Schema(
                type=types.Type.OBJECT,
                required=[
                    "id",
                    "question",
                    "options",
                    "correct_answer",
                    "explanation",
                ],
                properties={
                    "id": types.Schema(type=types.Type.STRING),
                    "question": types.Schema(type=types.Type.STRING),
                    "options": types.Schema(
                        type=types.Type.ARRAY,
                        min_items=4,
                        max_items=4,
                        items=types.Schema(
                            type=types.Type.OBJECT,
                            required=["id", "text"],
                            properties={
                                "id": types.Schema(type=types.Type.STRING),
                                "text": types.Schema(type=types.Type.STRING),
                            },
                        ),
                    ),
                    "correct_answer": types.Schema(type=types.Type.STRING),
                    "explanation": types.Schema(type=types.Type.STRING),
                },
            ),
        ),
    },
)


class GeminiServiceError(Exception):
    """Raised for any Gemini call/parse failure. Message is safe to show to users."""


def _strip_markdown_fences(text: str) -> str:
    """Defensive cleanup in case the model wraps JSON in ```json ... ``` anyway."""
    stripped = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", stripped, re.DOTALL)
    return match.group(1) if match else stripped


def generate_learning_content(user_input: str) -> dict:
    """Calls Gemini and returns a parsed dict. Raises GeminiServiceError on any failure."""
    if not GEMINI_API_KEY:
        raise GeminiServiceError("The AI service is not configured.")

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=f"Generate learning content for the following topic or notes:\n\n{user_input}",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=LEARNING_CONTENT_SCHEMA,
                temperature=0.4,
                max_output_tokens=4096,
            ),
        )
    except Exception as exc:  # any SDK/network failure becomes a safe error
        raise GeminiServiceError("The AI service is temporarily busy. Please try again in a moment") from exc

    raw_text = (response.text or "").strip()
    if not raw_text:
        raise GeminiServiceError("The AI service returned an empty response.")

    try:
        return json.loads(_strip_markdown_fences(raw_text))
    except json.JSONDecodeError as exc:
        raise GeminiServiceError("The AI service returned an unreadable response.") from exc
