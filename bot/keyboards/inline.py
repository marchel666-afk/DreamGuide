from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from bot.config import settings


def main_menu_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="📖 Открыть дневник снов",
            web_app=WebAppInfo(url=settings.WEBAPP_URL),
        )
    )
    builder.row(
        InlineKeyboardButton(text="🌙 Записать сон", callback_data="new_dream")
    )
    return builder.as_markup()


def emotion_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="😨 Страх", callback_data="emotion:fear"),
        InlineKeyboardButton(text="😊 Радость", callback_data="emotion:joy"),
    )
    builder.row(
        InlineKeyboardButton(text="😔 Тоска", callback_data="emotion:sadness"),
        InlineKeyboardButton(text="😲 Удивление", callback_data="emotion:surprise"),
    )
    return builder.as_markup()


def interpretation_type_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="🧠 Психологическая",
            callback_data="interpret:psychological",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="🏠 Бытовая",
            callback_data="interpret:everyday",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="🎨 Творческая",
            callback_data="interpret:creative",
        )
    )
    builder.row(
        InlineKeyboardButton(text="◀️ Назад", callback_data="back")
    )
    return builder.as_markup()


def payment_keyboard(price: int, payload: str) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text=f"⭐ Оплатить {price} звёзд",
            pay=True,
        )
    )
    builder.row(
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel")
    )
    return builder.as_markup()


def premium_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="👑 Купить Премиум — 49 звёзд",
            callback_data="buy:premium_month",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="🚫 Без рекламы — 12 звёзд",
            callback_data="buy:no_ads_week",
        )
    )
    builder.row(
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel")
    )
    return builder.as_markup()


def share_dream_keyboard(dream_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="🌐 Поделиться в галерее",
            callback_data=f"toggle_public:{dream_id}",
        )
    )
    builder.row(
        InlineKeyboardButton(
            text="📄 Скачать PDF — 25 звёзд",
            callback_data=f"buy_pdf:{dream_id}",
        )
    )
    builder.row(
        InlineKeyboardButton(text="◀️ Назад", callback_data="back")
    )
    return builder.as_markup()


def back_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="◀️ Назад", callback_data="back")
    )
    return builder.as_markup()


def streak_milestone_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(
            text="🏆 Поделиться достижением",
            callback_data="share_streak",
        )
    )
    builder.row(
        InlineKeyboardButton(text="▶️ Продолжить", callback_data="continue")
    )
    return builder.as_markup()
