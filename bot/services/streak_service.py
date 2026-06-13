from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from bot.database.crud import update_user

MILESTONE_MESSAGES: dict[int, str] = {
    3: "🔥 3 дня подряд! Твой разум открывается миру снов...",
    7: "⭐ 7 дней! Неделя погружения в подсознание — ты настоящий исследователь!",
    30: "🌙 30 дней! Мастер сновидений. Ты достиг редкого уровня осознанности!",
}


async def check_streak_milestone(streak: int) -> str | None:
    """Return a milestone message if the streak hits a celebrated number, else None."""
    return MILESTONE_MESSAGES.get(streak)


async def update_streak(session: AsyncSession, user) -> tuple[int, str | None]:
    """Recalculate the user's streak after recording a new dream.

    Rules:
    - If the user recorded a dream yesterday, increment the streak.
    - If the user already recorded a dream today, keep the streak unchanged.
    - If more than one day has passed since the last dream, reset to 1.

    Updates ``last_dream_date`` to today and persists the new streak.

    Returns:
        (new_streak, milestone_message_or_None)
    """
    today = date.today()
    last_date: date | None = user.last_dream_date

    if last_date is None:
        # First ever dream
        new_streak = 1
    elif last_date == today:
        # Already logged a dream today — no change
        new_streak = user.streak_days or 1
    elif last_date == today - timedelta(days=1):
        # Consecutive day
        new_streak = (user.streak_days or 0) + 1
    else:
        # Gap detected — reset
        new_streak = 1

    await update_user(
        session,
        user.id,
        streak_days=new_streak,
        last_dream_date=today,
    )

    milestone = await check_streak_milestone(new_streak)
    return new_streak, milestone
