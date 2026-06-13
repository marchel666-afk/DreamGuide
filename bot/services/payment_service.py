import logging
from aiogram import Bot
from aiogram.types import LabeledPrice
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.database.crud import update_user, create_payment

logger = logging.getLogger(__name__)

PRICES = settings.PRICES

_ITEM_DESCRIPTIONS: dict[str, tuple[str, str]] = {
    "deep_interpret": (
        "Глубокая интерпретация сна",
        "Развёрнутый психологический анализ вашего сна с использованием методов юнгианской психологии.",
    ),
    "nightmare": (
        "Анализ кошмара",
        "Детальный разбор тревожного сна: причины, символы и рекомендации по снижению тревоги.",
    ),
    "pdf_export": (
        "Экспорт дневника в PDF",
        "Сохраните выбранный сон в красивом PDF-формате для личного архива.",
    ),
    "secret_symbol": (
        "Тайный символ сна",
        "Узнайте скрытый мистический символ вашего сна и его значение.",
    ),
    "no_ads_week": (
        "Без рекламы на неделю",
        "Наслаждайтесь DreamGuide без рекламных сообщений в течение 7 дней.",
    ),
    "premium_month": (
        "Премиум подписка на месяц",
        "Полный доступ ко всем функциям DreamGuide: безлимитные интерпретации, "
        "тайные символы, PDF-экспорт и отсутствие рекламы на 30 дней.",
    ),
}


def get_item_description(item: str) -> tuple[str, str]:
    """Return (title, description) in Russian for a given item key."""
    return _ITEM_DESCRIPTIONS.get(
        item,
        ("Покупка в DreamGuide", "Дополнительная функция дневника сновидений."),
    )


async def create_stars_invoice(
    bot: Bot,
    chat_id: int,
    item: str,
    user_id: int,
) -> None:
    """Send a Telegram Stars invoice to the user for the given item."""
    price = PRICES.get(item)
    if price is None:
        logger.error("Unknown payment item: %s", item)
        return

    title, description = get_item_description(item)
    payload = f"{user_id}:{item}"

    await bot.send_invoice(
        chat_id=chat_id,
        title=title,
        description=description,
        payload=payload,
        currency="XTR",
        prices=[LabeledPrice(label=title, amount=price)],
    )


async def process_successful_payment(
    session: AsyncSession,
    user_id: int,
    payload: str,
) -> str:
    """Handle a successful Stars payment.

    Updates the user's premium status where applicable and records the
    payment in the database.  Returns a Russian confirmation message.
    """
    parts = payload.split(":", 1)
    if len(parts) != 2:
        logger.error("Malformed payment payload: %s", payload)
        return "Оплата получена. Спасибо!"

    paid_user_id_str, item = parts
    try:
        paid_user_id = int(paid_user_id_str)
    except ValueError:
        paid_user_id = user_id

    price = PRICES.get(item, 0)
    await create_payment(
        session,
        user_id=paid_user_id,
        provider="stars",
        amount=price,
        payload=payload,
    )

    if item == "premium_month":
        from datetime import date, timedelta

        premium_until = date.today() + timedelta(days=30)
        await update_user(
            session,
            paid_user_id,
            is_premium=True,
            premium_until=premium_until,
        )
        return (
            "🎉 Поздравляем! Вы активировали Премиум подписку на 30 дней.\n"
            "Теперь вам доступны безлимитные интерпретации, тайные символы и PDF-экспорт!"
        )

    if item == "no_ads_week":
        from datetime import date, timedelta

        no_ads_until = date.today() + timedelta(days=7)
        await update_user(session, paid_user_id, no_ads_until=no_ads_until)
        return (
            "✅ Готово! Реклама отключена на 7 дней. "
            "Наслаждайтесь дневником сновидений без отвлечений."
        )

    if item == "pdf_export":
        return (
            "📄 Оплата принята! Ваш PDF-файл будет сформирован и отправлен в ближайшее время."
        )

    if item == "deep_interpret":
        return (
            "🧠 Оплата принята! Глубокая интерпретация вашего сна готовится..."
        )

    if item == "nightmare":
        return (
            "🌑 Оплата принята! Анализ кошмара начинается — мы поможем разобраться в тревогах."
        )

    if item == "secret_symbol":
        return (
            "✨ Оплата принята! Тайный символ вашего сна сейчас откроется..."
        )

    title, _ = get_item_description(item)
    return f"✅ Оплата за «{title}» успешно получена. Спасибо!"
