from aiogram import F, Router
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, Message
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.crud import create_dream, get_or_create_user
from bot.keyboards.inline import emotion_keyboard, interpretation_type_keyboard

router = Router()

DREAM_TEXT_MIN = 20
DREAM_TEXT_MAX = 3000


class DreamStates(StatesGroup):
    waiting_text = State()
    waiting_emotion = State()


@router.callback_query(F.data == "new_dream")
async def cb_new_dream(callback: CallbackQuery, state: FSMContext) -> None:
    await state.set_state(DreamStates.waiting_text)
    await callback.message.answer(
        "🌙 <b>Запись нового сна</b>\n\n"
        "Расскажи свой сон как можно подробнее. "
        "Опиши всё, что ты помнишь: образы, людей, места, события и чувства.\n\n"
        f"<i>Минимум {DREAM_TEXT_MIN} символов, максимум {DREAM_TEXT_MAX}.</i>",
        parse_mode="HTML",
    )
    await callback.answer()


@router.message(StateFilter(DreamStates.waiting_text))
async def handle_dream_text(message: Message, state: FSMContext, session: AsyncSession) -> None:
    text = (message.text or "").strip()

    if len(text) < DREAM_TEXT_MIN:
        await message.answer(
            f"✏️ Текст слишком короткий. Пожалуйста, опиши сон подробнее "
            f"(минимум {DREAM_TEXT_MIN} символов, сейчас {len(text)})."
        )
        return

    if len(text) > DREAM_TEXT_MAX:
        await message.answer(
            f"✏️ Текст слишком длинный. Пожалуйста, сократи описание "
            f"(максимум {DREAM_TEXT_MAX} символов, сейчас {len(text)})."
        )
        return

    await state.update_data(dream_text=text)
    await state.set_state(DreamStates.waiting_emotion)

    await message.answer(
        "💫 <b>Отлично!</b> Сон записан.\n\n"
        "Теперь выбери эмоцию, которая лучше всего описывает твои ощущения во время этого сна:",
        parse_mode="HTML",
        reply_markup=emotion_keyboard(),
    )


@router.callback_query(F.data.startswith("emotion:"), StateFilter(DreamStates.waiting_emotion))
async def handle_emotion(callback: CallbackQuery, state: FSMContext, session: AsyncSession) -> None:
    emotion = callback.data.split(":", 1)[1]
    valid_emotions = {"fear", "joy", "sadness", "surprise"}

    if emotion not in valid_emotions:
        await callback.answer("Неизвестная эмоция.", show_alert=True)
        return

    data = await state.get_data()
    dream_text = data.get("dream_text", "")

    user = await get_or_create_user(
        session,
        telegram_id=callback.from_user.id,
        username=callback.from_user.username,
        first_name=callback.from_user.first_name or "Путник",
    )

    dream = await create_dream(
        session,
        user_id=user.id,
        text=dream_text,
        emotion=emotion,
    )

    await state.update_data(dream_id=dream.id)

    emotion_labels = {
        "fear": "😨 Страх",
        "joy": "😊 Радость",
        "sadness": "😔 Тоска",
        "surprise": "😲 Удивление",
    }
    emotion_label = emotion_labels.get(emotion, emotion)

    await callback.message.edit_text(
        f"✅ <b>Сон сохранён!</b>\n\n"
        f"Эмоция: {emotion_label}\n\n"
        "Выбери тип интерпретации:",
        parse_mode="HTML",
        reply_markup=interpretation_type_keyboard(),
    )
    await callback.answer()
