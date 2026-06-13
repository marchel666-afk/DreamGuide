import logging
from datetime import date

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.database.crud import (
    create_interpretation,
    get_dream,
    get_or_create_user,
    increment_free_interpretations,
    update_user,
)
from bot.keyboards.inline import payment_keyboard, share_dream_keyboard, streak_milestone_keyboard
from bot.services import ai_service

logger = logging.getLogger(__name__)

router = Router()

STREAK_MILESTONES = {7, 14, 30, 60, 100}

INTERPRET_TYPE_LABELS = {
    "psychological": "🧠 Психологическая",
    "everyday": "🏠 Бытовая",
    "creative": "🎨 Творческая",
    "nightmare": "👁 Кошмар (премиум)",
}

EMOTION_LABELS = {
    "fear": "😨 Страх",
    "joy": "😊 Радость",
    "sadness": "😔 Тоска",
    "surprise": "😲 Удивление",
}


def _reset_daily_count_if_needed(user) -> None:
    today = date.today()
    if user.last_interpretation_date != today:
        user.free_interpretations_today = 0
        user.last_interpretation_date = today


@router.callback_query(F.data.startswith("interpret:"))
async def cb_interpret(callback: CallbackQuery, state: FSMContext, session: AsyncSession) -> None:
    parts = callback.data.split(":")
    interpret_type = parts[1] if len(parts) > 1 else "psychological"

    fsm_data = await state.get_data()
    dream_id = fsm_data.get("dream_id")

    if not dream_id:
        await callback.answer("Сон не найден. Запиши новый сон.", show_alert=True)
        return

    dream = await get_dream(session, dream_id)
    if not dream:
        await callback.answer("Сон не найден в базе данных.", show_alert=True)
        return

    user = await get_or_create_user(
        session,
        telegram_id=callback.from_user.id,
        username=callback.from_user.username,
        first_name=callback.from_user.first_name or "Путник",
    )

    _reset_daily_count_if_needed(user)

    is_premium_type = interpret_type == "nightmare"

    if is_premium_type:
        price = settings.PRICES["nightmare"]
        payload = f"nightmare:{dream_id}"
        await callback.message.answer(
            f"👁 <b>Интерпретация кошмара</b> — это премиум-функция.\n\n"
            f"Глубокий анализ тёмных образов и скрытых страхов стоит "
            f"<b>{price} звёзд</b>.\n\n"
            "Нажми кнопку ниже для оплаты:",
            parse_mode="HTML",
            reply_markup=payment_keyboard(price, payload),
        )
        await callback.answer()
        return

    if user.free_interpretations_today >= settings.FREE_INTERPRETATIONS_PER_DAY:
        price = settings.PRICES["deep_interpret"]
        payload = f"deep_interpret:{dream_id}:{interpret_type}"
        await callback.message.answer(
            f"⚠️ <b>Лимит исчерпан</b>\n\n"
            f"Ты использовал все {settings.FREE_INTERPRETATIONS_PER_DAY} бесплатные интерпретации на сегодня.\n\n"
            f"Получи дополнительную интерпретацию за <b>{price} звёзд</b> "
            "или приходи завтра:",
            parse_mode="HTML",
            reply_markup=payment_keyboard(price, payload),
        )
        await callback.answer()
        return

    await callback.message.edit_text(
        "🔮 Интерпретирую твой сон... Это займёт несколько секунд.",
        parse_mode="HTML",
    )

    interpretation_text = await ai_service.interpret_dream(
        dream_text=dream.text,
        emotion=dream.emotion,
        interpretation_type=interpret_type,
    )

    await create_interpretation(
        session,
        dream_id=dream.id,
        type=interpret_type,
        content=interpretation_text,
        is_premium=False,
    )

    user = await increment_free_interpretations(session, user)

    type_label = INTERPRET_TYPE_LABELS.get(interpret_type, interpret_type)
    emotion_label = EMOTION_LABELS.get(dream.emotion, dream.emotion)

    response_text = (
        f"✨ <b>Интерпретация сна</b>\n"
        f"<i>Тип: {type_label} | Эмоция: {emotion_label}</i>\n"
        f"{'─' * 30}\n\n"
        f"{interpretation_text}\n\n"
        f"{'─' * 30}\n"
        f"<i>Осталось бесплатных интерпретаций сегодня: "
        f"{max(0, settings.FREE_INTERPRETATIONS_PER_DAY - user.free_interpretations_today)}</i>"
    )

    await callback.message.edit_text(
        response_text,
        parse_mode="HTML",
        reply_markup=share_dream_keyboard(dream.id),
    )

    await _check_and_update_streak(callback.message, session, user)
    await callback.answer()


async def _check_and_update_streak(message: Message, session: AsyncSession, user) -> None:
    today = date.today()
    if user.last_dream_date == today:
        return

    from datetime import timedelta
    yesterday = today - timedelta(days=1)
    if user.last_dream_date == yesterday:
        new_streak = (user.streak_days or 0) + 1
    else:
        new_streak = 1

    await update_user(
        session,
        user.id,
        streak_days=new_streak,
        last_dream_date=today,
    )

    if new_streak in STREAK_MILESTONES:
        await message.answer(
            f"🏆 <b>Достижение разблокировано!</b>\n\n"
            f"Ты записываешь сны <b>{new_streak} дней подряд</b>! "
            "Это вдохновляет — продолжай исследовать мир своих снов! 🌙",
            parse_mode="HTML",
            reply_markup=streak_milestone_keyboard(),
        )
