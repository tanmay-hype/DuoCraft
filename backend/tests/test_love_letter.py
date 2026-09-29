import json
from uuid import uuid4

import httpx
import pytest
from fastapi import HTTPException
from redis.exceptions import RedisError

from app.core import rate_limit
from app.core.config import settings
from app.schemas.love_letter import LoveLetterGenerateRequest
from app.services.love_letter import (
    LoveLetterGenerationError,
    LoveLetterSafetyError,
    build_love_letter_prompt,
    generate_love_letter,
)


class RateLimitRedis:
    def __init__(self) -> None:
        self.counts: dict[str, int] = {}
        self.expirations: dict[str, int] = {}

    def incr(self, key: str) -> int:
        self.counts[key] = self.counts.get(key, 0) + 1
        return self.counts[key]

    def expire(self, key: str, seconds: int) -> bool:
        self.expirations[key] = seconds
        return True


class FailingRateLimitRedis:
    def incr(self, key: str) -> int:
        raise RedisError("Redis unavailable")


def make_request() -> LoveLetterGenerateRequest:
    return LoveLetterGenerateRequest(
        recipient_name="Alex",
        relationship="partner",
        memories="The rainy Sunday we spent cooking together.",
        language="english",
        tone="tender",
        length="medium",
    )


def test_prompt_contains_context_without_changing_the_contract() -> None:
    prompt = build_love_letter_prompt(make_request())

    assert "Alex" in prompt
    assert "partner" in prompt
    assert "rainy Sunday" in prompt
    assert "Return only valid JSON" in prompt
    assert "550 words" in prompt


def test_prompt_supports_hindi_and_original_literary_style() -> None:
    request = make_request().model_copy(update={"language": "hindi"})
    prompt = build_love_letter_prompt(request)

    assert "Hindi using Devanagari" in prompt
    assert "Do not quote" in prompt


def test_love_letter_generation_rejects_minor_context() -> None:
    request = LoveLetterGenerateRequest(
        recipient_name="Alex",
        relationship="friend",
        memories="They are under 18.",
    )

    with pytest.raises(LoveLetterSafetyError):
        generate_love_letter(request)


def test_love_letter_generation_parses_provider_json(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    long_message = " ".join(["You make ordinary days feel like home."] * 80)
    response = httpx.Response(
        200,
        json={
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": json.dumps(
                                    {
                                        "headline": "For Alex",
                                        "message": long_message,
                                    },
                                ),
                            },
                        ],
                    },
                },
            ],
        },
        request=httpx.Request("POST", "https://example.test"),
    )
    monkeypatch.setattr(
        "app.services.love_letter.httpx.post",
        lambda *args, **kwargs: response,
    )
    original_enabled = settings.llm_enabled
    original_key = settings.gemini_api_key

    try:
        settings.llm_enabled = True
        settings.gemini_api_key = "test-key"
        generated = generate_love_letter(make_request())
    finally:
        settings.llm_enabled = original_enabled
        settings.gemini_api_key = original_key

    assert generated.headline == "For Alex"
    assert len(generated.message.split()) >= 400
    assert generated.model == settings.gemini_model
    assert generated.provider == "gemini"


def test_love_letter_generation_falls_back_to_ollama(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    long_message = " ".join(["You are my favorite story."] * 80)
    ollama_response = httpx.Response(
        200,
        json={
            "message": {
                "content": json.dumps(
                    {
                        "headline": "A letter for Alex",
                        "message": long_message,
                    },
                ),
            },
        },
        request=httpx.Request("POST", "http://ollama:11434/api/chat"),
    )
    calls: list[str] = []

    def fake_post(url: str, **kwargs: object) -> httpx.Response:
        calls.append(url)

        if "generativelanguage.googleapis.com" in url:
            return httpx.Response(
                503,
                request=httpx.Request("POST", url),
            )

        return ollama_response

    monkeypatch.setattr("app.services.love_letter.httpx.post", fake_post)
    original_enabled = settings.llm_enabled
    original_key = settings.gemini_api_key

    try:
        settings.llm_enabled = True
        settings.gemini_api_key = "test-key"
        generated = generate_love_letter(make_request())
    finally:
        settings.llm_enabled = original_enabled
        settings.gemini_api_key = original_key

    assert len(calls) == 2
    assert calls[1].endswith("/api/chat")
    assert generated.provider == "ollama"
    assert generated.model == settings.ollama_model


def test_love_letter_generation_is_disabled_without_configuration() -> None:
    original_enabled = settings.llm_enabled
    original_key = settings.gemini_api_key

    try:
        settings.llm_enabled = False
        settings.gemini_api_key = ""

        with pytest.raises(LoveLetterGenerationError, match="not configured"):
            generate_love_letter(make_request())
    finally:
        settings.llm_enabled = original_enabled
        settings.gemini_api_key = original_key


def test_love_letter_rate_limit_returns_remaining_requests(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    redis_client = RateLimitRedis()
    monkeypatch.setattr(rate_limit, "get_redis_client", lambda: redis_client)
    original_limit = settings.llm_max_requests_per_window
    original_window = settings.llm_rate_limit_window_seconds
    draft_id = uuid4()

    try:
        settings.llm_max_requests_per_window = 2
        settings.llm_rate_limit_window_seconds = 90

        assert rate_limit.enforce_love_letter_rate_limit(draft_id) == 1
        assert rate_limit.enforce_love_letter_rate_limit(draft_id) == 0

        with pytest.raises(HTTPException) as raised:
            rate_limit.enforce_love_letter_rate_limit(draft_id)
    finally:
        settings.llm_max_requests_per_window = original_limit
        settings.llm_rate_limit_window_seconds = original_window

    assert raised.value.status_code == 429
    assert raised.value.headers["Retry-After"] == "90"


def test_love_letter_rate_limit_fails_closed_when_redis_is_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        rate_limit,
        "get_redis_client",
        lambda: FailingRateLimitRedis(),
    )

    with pytest.raises(HTTPException) as raised:
        rate_limit.enforce_love_letter_rate_limit(uuid4())

    assert raised.value.status_code == 503