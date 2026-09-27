
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from gemini_service import MAX_INPUT_LENGTH, GeminiServiceError, generate_learning_content

app = FastAPI(title="Distill API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://client-five-sand-86.vercel.app"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class GenerateRequest(BaseModel):
    input: str = Field(min_length=1)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/generate")
def generate(request: GenerateRequest):
    user_input = request.input.strip()

    if not user_input:
        raise HTTPException(status_code=400, detail="Please provide a topic or some notes to break down.")

    if len(user_input) > MAX_INPUT_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Input is too long. Please keep it under {MAX_INPUT_LENGTH} characters.",
        )

    try:
        return generate_learning_content(user_input)
    except GeminiServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
