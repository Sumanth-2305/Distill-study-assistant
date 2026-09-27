import { useState } from "react";

import "./HomeInput.css";

export function HomeInput({ onSubmit }) {
  const [text, setText] = useState("");
  const isEmpty = text.trim().length === 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (isEmpty) return;
    onSubmit(text);
  }

  return (
    <div className="container home-input">
      <div className="home-input__glow" aria-hidden="true" />

      <div className="home-input__intro enter-fade-up">
        <span className="home-input__badge">AI-powered breakdowns</span>
        <h1>Distill</h1>
        <p>
          Paste your notes or type any topic. Get a clear breakdown, flashcards,
          and a quiz — generated instantly.
        </p>
      </div>

      <form
        className="card home-input__form enter-fade-up"
        style={{ "--enter-delay": "120ms" }}
        onSubmit={handleSubmit}
      >
        <label htmlFor="topic-input" className="visually-hidden">
          Topic or notes
        </label>
        <textarea
          id="topic-input"
          className="home-input__textarea"
          placeholder="Enter a topic (e.g. “Photosynthesis”) or paste your notes here…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
        />
        <div className="home-input__actions">
          <button type="submit" className="btn btn-primary" disabled={isEmpty}>
            Distill it
          </button>
        </div>
      </form>
    </div>
  );
}
