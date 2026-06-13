from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.crud import get_or_create_user
from bot.keyboards.inline import main_menu_keyboard

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message, session: AsyncSession) -> None:
    user = await get_or_create_user(
        session,
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name or "Путник",
    )

    welcome_text = (
        f"✨ Добро пожаловать в <b>DreamGuide</b>, {user.first_name}!\n\n"
        "🌙 <b>DreamGuide</b> — это твой личный дневник снов с интерпретацией на основе ИИ.\n\n"
        "Здесь ты можешь:\n"
        "• 📝 Записывать свои сны каждую ночь\n"
        "• 🔮 Получать психологические, бытовые и творческие интерпретации\n"
        "• 📊 Отслеживать эмоции и паттерны своих снов\n"
        "• 🌐 Делиться снами в публичной галерее\n\n"
        "Каждый день — <b>3 бесплатные интерпретации</b>. "
        "Начни прямо сейчас! 👇"
    )

    await message.answer(
        welcome_text,
        parse_mode="HTML",
        reply_markup=main_menu_keyboard(),
    )
