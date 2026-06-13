from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from collections import defaultdict

from bot.database.models import User, Dream
from api.database import get_db
from api.deps import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dream).where(Dream.user_id == user.id))
    dreams = result.scalars().all()

    emotions: dict[str, int] = defaultdict(int)
    for d in dreams:
        if d.emotion:
            emotions[d.emotion] += 1

    recent = sorted(dreams, key=lambda d: d.created_at, reverse=True)[:5]

    return {
        "total_dreams": len(dreams),
        "streak_days": user.streak_days,
        "total_stars": user.total_stars,
        "emotions": dict(emotions),
        "recent_dreams": [
            {
                "id": d.id, "user_id": d.user_id, "text": d.text,
                "emotion": d.emotion, "created_at": d.created_at,
                "is_public": d.is_public, "interpretations": [],
            }
            for d in recent
        ],
    }


@router.get("/calendar")
async def get_calendar(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dream).where(Dream.user_id == user.id))
    dreams = result.scalars().all()

    calendar: dict[str, int] = defaultdict(int)
    for d in dreams:
        day = d.created_at.strftime("%Y-%m-%d")
        calendar[day] += 1

    return dict(calendar)


@router.get("/emotions")
async def get_emotions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dream).where(Dream.user_id == user.id))
    dreams = result.scalars().all()

    emotions: dict[str, int] = defaultdict(int)
    for d in dreams:
        if d.emotion:
            emotions[d.emotion] += 1

    return dict(emotions)
