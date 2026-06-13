import httpx
import logging
from bot.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://openrouter.ai/api/v1"
FREE_MODEL = "mistralai/mistral-7b-instruct:free"

SYSTEM_PROMPTS = {
    "psychological": """Ты опытный психолог-аналитик сновидений. Интерпретируй сон с точки зрения психоанализа и юнгианской психологии.
Анализируй символы, архетипы и скрытые страхи/желания. Пиши на русском языке, глубоко и вдумчиво, 2-3 абзаца.""",

    "everyday": """Ты мудрый толкователь снов. Объясни сон простым языком, связывая его с реальными событиями и переживаниями человека.
Дай практические советы. Пиши на русском языке, понятно и доступно, 2-3 абзаца.""",

    "creative": """Ты поэт и художник слова. Интерпретируй сон как творческое произведение — найди метафоры, образы, скрытые смыслы.
Создай красивое, образное описание. Пиши на русском языке, вдохновенно и художественно, 2-3 абзаца.""",
}

_FALLBACK_MESSAGE = (
    "К сожалению, сервис интерпретации временно недоступен. "
    "Пожалуйста, попробуйте позже."
)

_SECRET_SYMBOL_FALLBACK = (
    "✨ Луна — символ тайного знания и внутренней мудрости. "
    "Она освещает скрытые пути вашего подсознания и указывает на перемены."
)


def _build_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.WEBAPP_URL,
        "X-Title": "DreamGuide",
    }


async def interpret_dream(dream_text: str, emotion: str, interpretation_type: str) -> str:
    """Interpret a dream via OpenRouter API.

    Returns the interpretation text, or a Russian fallback message on error.
    """
    system_prompt = SYSTEM_PROMPTS.get(interpretation_type, SYSTEM_PROMPTS["psychological"])

    emotion_map = {
        "fear": "страх",
        "joy": "радость",
        "sadness": "тоска",
        "surprise": "удивление",
    }
    emotion_ru = emotion_map.get(emotion, emotion)

    user_message = (
        f"Описание сна:\n\"{dream_text}\"\n\n"
        f"Эмоциональный фон сна: {emotion_ru}\n\n"
        "Пожалуйста, дай интерпретацию этого сна."
    )

    payload = {
        "model": FREE_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": 600,
        "temperature": 0.75,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BASE_URL}/chat/completions",
                headers=_build_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as exc:
        logger.error(
            "OpenRouter HTTP error %s: %s",
            exc.response.status_code,
            exc.response.text,
        )
        return _FALLBACK_MESSAGE
    except Exception as exc:
        logger.error("OpenRouter unexpected error: %s", exc)
        return _FALLBACK_MESSAGE


async def get_secret_symbol(dream_text: str) -> str:
    """Return a mystical symbol and its meaning based on dream content.

    Short, 2-3 sentences in Russian. Returns a fallback message on error.
    """
    system_prompt = (
        "Ты мистический толкователь символов сновидений. "
        "По описанию сна выбери один главный тайный символ и объясни его значение. "
        "Ответ должен быть коротким — 2-3 предложения на русском языке. "
        "Начни с самого символа, например: '🌊 Вода — символ...'."
    )

    payload = {
        "model": FREE_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Сон: {dream_text}"},
        ],
        "max_tokens": 150,
        "temperature": 0.8,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{BASE_URL}/chat/completions",
                headers=_build_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.HTTPStatusError as exc:
        logger.error(
            "OpenRouter HTTP error (symbol) %s: %s",
            exc.response.status_code,
            exc.response.text,
        )
        return _SECRET_SYMBOL_FALLBACK
    except Exception as exc:
        logger.error("OpenRouter unexpected error (symbol): %s", exc)
        return _SECRET_SYMBOL_FALLBACK
