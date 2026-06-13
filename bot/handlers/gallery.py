"""Handler for browsing the public dream gallery."""
from aiogram import F, Router
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.crud import get_public_dreams

router = Router()

EMOTION_EMOJI = {
    "fear": "😨",
    "joy": "😊",
    "sadness": "😔",
    "surprise": "😲",
}


@router.callback_query(F.data == "gallery")
async def cb_gallery(callback: CallbackQuery, session: AsyncSession) -> None:
    dreams = await get_public_dreams(session, limit=5, offset=0)

    if not dreams:
        await callback.message.edit_text(
            "🖼 <b>Галерея снов</b>\n\nПока нет публичных снов. Поделись своим первым!",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="🏠 Главное меню", callback_data="back_to_menu")]
                ]
            ),
        )
        await callback.answer()
        return

    lines = ["🖼 <b>Галерея снов</b>\n<i>Анонимные публичные сны пользователей</i>\n"]
    for dream in dreams:
        emoji = EMOTION_EMOJI.get(dream.emotion, "🌙")
        date_str = dream.created_at.strftime("%d.%m.%Y")
        # Anonymize: show first name initials from user relationship if loaded
        author = "Аноним"
        if dream.user and dream.user.first_name:
            first = dream.user.first_name
            author = first[0].upper() + "."
        preview = dream.text[:80] + ("…" if len(dream.text) > 80 else "")
        lines.append(f"{emoji} <b>{date_str}</b> — {author}\n{preview}\n")

    await callback.message.edit_text(
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="🏠 Главное меню", callback_data="back_to_menu")]
            ]
        ),
    )
    await callback.answer()
