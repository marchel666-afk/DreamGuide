import io
import logging
from datetime import datetime, timedelta

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import (
    BufferedInputFile,
    Message,
    PreCheckoutQuery,
)
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.crud import (
    create_interpretation,
    create_payment,
    get_dream,
    get_or_create_user,
    update_user,
)
from bot.keyboards.inline import main_menu_keyboard, share_dream_keyboard
from bot.services import ai_service

logger = logging.getLogger(__name__)

router = Router()


@router.pre_checkout_query()
async def handle_pre_checkout(pre_checkout: PreCheckoutQuery) -> None:
    await pre_checkout.answer(ok=True)


@router.message(F.successful_payment)
async def handle_successful_payment(
    message: Message,
    session: AsyncSession,
    state: FSMContext,
) -> None:
    payment = message.successful_payment
    payload = payment.invoice_payload
    stars_amount = payment.total_amount

    user = await get_or_create_user(
        session,
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name or "Путник",
    )

    await create_payment(
        session,
        user_id=user.id,
        provider="stars",
        amount=stars_amount,
        payload=payload,
    )

    parts = payload.split(":")

    if parts[0] == "premium_month":
        premium_until = datetime.utcnow() + timedelta(days=30)
        await update_user(
            session,
            user.id,
            is_premium=True,
            premium_until=premium_until,
        )
        await message.answer(
            "👑 <b>Премиум активирован!</b>\n\n"
            f"Твой премиум-доступ действует до <b>{premium_until.strftime('%d.%m.%Y')}</b>.\n\n"
            "Теперь тебе доступны:\n"
            "• Безлимитные интерпретации снов\n"
            "• Интерпретации кошмаров\n"
            "• Приоритетная обработка запросов\n\n"
            "Спасибо за поддержку! 🌙",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )

    elif parts[0] == "no_ads_week":
        await message.answer(
            "🚫 <b>Реклама отключена!</b>\n\n"
            "Ты будешь видеть DreamGuide без рекламы в течение <b>7 дней</b>.\n\n"
            "Наслаждайся чистым дневником снов! ✨",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )

    elif parts[0] in ("deep_interpret", "nightmare"):
        dream_id = int(parts[1]) if len(parts) > 1 else None
        interpret_type = parts[2] if len(parts) > 2 else "psychological"

        if parts[0] == "nightmare":
            interpret_type = "nightmare"

        if dream_id:
            dream = await get_dream(session, dream_id)
            if dream:
                await message.answer(
                    "🔮 <b>Оплата получена!</b> Интерпретирую твой сон...",
                    parse_mode="HTML",
                )
                interpretation_text = await ai_service.interpret_dream(
                    dream_text=dream.text,
                    emotion=dream.emotion,
                    interpretation_type=interpret_type if interpret_type != "nightmare" else "psychological",
                )
                await create_interpretation(
                    session,
                    dream_id=dream.id,
                    type=interpret_type,
                    content=interpretation_text,
                    is_premium=True,
                )
                type_labels = {
                    "psychological": "🧠 Психологическая",
                    "everyday": "🏠 Бытовая",
                    "creative": "🎨 Творческая",
                    "nightmare": "👁 Кошмар",
                }
                type_label = type_labels.get(interpret_type, interpret_type)
                await message.answer(
                    f"✨ <b>Премиум-интерпретация сна</b>\n"
                    f"<i>Тип: {type_label}</i>\n"
                    f"{'─' * 30}\n\n"
                    f"{interpretation_text}",
                    parse_mode="HTML",
                    reply_markup=share_dream_keyboard(dream.id),
                )
                return

        await message.answer(
            "✅ <b>Оплата получена!</b>\n\n"
            "Интерпретация будет доступна при следующем обращении к этому сну.",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )

    elif parts[0] == "pdf_export":
        dream_id = int(parts[1]) if len(parts) > 1 else None
        if dream_id:
            dream = await get_dream(session, dream_id)
            if dream:
                pdf_bytes = _generate_simple_pdf(dream)
                filename = f"dream_{dream_id}.pdf"
                await message.answer_document(
                    document=BufferedInputFile(pdf_bytes, filename=filename),
                    caption=(
                        "📄 <b>Твой сон в формате PDF!</b>\n\n"
                        "Сохрани или поделись этим файлом. 🌙"
                    ),
                    parse_mode="HTML",
                )
                return

        await message.answer(
            "✅ <b>Оплата получена!</b>\n\n"
            "Произошла ошибка при генерации PDF. Обратись в поддержку.",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )

    elif parts[0] == "secret_symbol":
        dream_id = int(parts[1]) if len(parts) > 1 else None
        if dream_id:
            dream = await get_dream(session, dream_id)
            if dream:
                symbol_text = await ai_service.get_secret_symbol(dream.text)
                await message.answer(
                    f"🔮 <b>Тайный символ твоего сна</b>\n\n"
                    f"{symbol_text}",
                    parse_mode="HTML",
                    reply_markup=share_dream_keyboard(dream_id),
                )
                return

        await message.answer(
            "✅ <b>Оплата получена!</b>\n\n"
            "Произошла ошибка. Пожалуйста, попробуй ещё раз.",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )

    else:
        logger.warning("Unknown payment payload: %s", payload)
        await message.answer(
            "✅ <b>Оплата принята!</b>\n\n"
            "Спасибо за поддержку DreamGuide. 🌙",
            parse_mode="HTML",
            reply_markup=main_menu_keyboard(),
        )


def _generate_simple_pdf(dream) -> bytes:
    """Generate a minimal PDF for a dream record without external dependencies."""
    from datetime import timezone

    created_at = dream.created_at
    if created_at:
        date_str = created_at.strftime("%d.%m.%Y %H:%M")
    else:
        date_str = "неизвестно"

    emotion_map = {
        "fear": "Страх",
        "joy": "Радость",
        "sadness": "Тоска",
        "surprise": "Удивление",
    }
    emotion_str = emotion_map.get(dream.emotion, dream.emotion or "")

    safe_text = (dream.text or "").replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    lines = []
    chunk_size = 80
    raw = dream.text or ""
    for i in range(0, len(raw), chunk_size):
        chunk = raw[i : i + chunk_size].replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        lines.append(chunk)

    pdf_lines = [
        "%PDF-1.4",
        "1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj",
        "2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj",
    ]

    content_lines = [
        "BT",
        "/F1 18 Tf",
        "50 780 Td",
        "(DreamGuide - Dnevnik snov) Tj",
        "/F1 12 Tf",
        "0 -30 Td",
        f"(Data: {date_str}) Tj",
        "0 -20 Td",
        f"(Emotsiya: {emotion_str}) Tj",
        "0 -30 Td",
        "/F1 11 Tf",
    ]
    for line in lines[:30]:
        content_lines.append(f"({line}) Tj")
        content_lines.append("0 -15 Td")

    content_lines.append("ET")
    stream_content = "\n".join(content_lines)

    resources = "<</Font <</F1 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>>>>>"
    stream_obj = (
        f"4 0 obj<</Length {len(stream_content)} /Resources {resources}"
        f" /MediaBox [0 0 595 842] /Type /Page /Parent 2 0 R>>\n"
        f"stream\n{stream_content}\nendstream\nendobj"
    )
    pdf_lines.append(stream_obj)
    pdf_lines.append("xref")
    pdf_lines.append("0 5")
    pdf_lines.append("0000000000 65535 f ")
    pdf_lines.append("trailer <</Size 5 /Root 1 0 R>>")
    pdf_lines.append("startxref")
    pdf_lines.append("0")
    pdf_lines.append("%%EOF")

    return "\n".join(pdf_lines).encode("latin-1", errors="replace")
