const API_URL = "http://localhost:8000/api/generate";
const REQUEST_TIMEOUT_MS = 30000;

/**
 * The only fetch() call in the app. Never throws — always resolves to either
 * { ok: true, data } or { ok: false, error } so callers don't need try/catch.
 */
export async function generateLearningContent(input) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const message =
        (body && typeof body.detail === "string" && body.detail) ||
        "Something went wrong while generating your breakdown. Please try again.";
      return { ok: false, error: message };
    }

    if (!body) {
      return {
        ok: false,
        error: "Something went wrong while generating your breakdown. Please try again.",
      };
    }

    return { ok: true, data: body };
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        ok: false,
        error: "The request took too long. Please check your connection and try again.",
      };
    }
    return {
      ok: false,
      error: "Unable to reach the server. Please check your connection and try again.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
