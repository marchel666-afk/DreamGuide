from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from bot.database.models import Dream, Interpretation
from api.database import get_db
from api.deps import get_current_user
from bot.database.models import User

router = APIRouter(prefix="/gallery", tags=["gallery"])


def get_initials(first_name: str, username: str | None) -> str:
    if username:
        return username[:2].upper()
    words = first_name.split()
    if len(words) >= 2:
        return (words[0][0] + words[1][0]).upper()
    return first_name[:2].upper() if first_name else "??"


@router.get("")
async def list_gallery(
    page: int = 1,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    limit = 20
    offset = (page - 1) * limit
    result = await db.execute(
        select(Dream)
        .where(Dream.is_public == True)
        .order_by(Dream.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    dreams = result.scalars().all()

    items = []
    for d in dreams:
        # Get user info
        user_result = await db.execute(select(User).where(User.id == d.user_id))
        dream_user = user_result.scalar_one_or_none()
        initials = get_initials(
            dream_user.first_name if dream_user else "?",
            dream_user.username if dream_user else None,
        )

        # Get first interpretation preview
        interp_result = await db.execute(
            select(Interpretation)
            .where(Interpretation.dream_id == d.id)
            .limit(1)
        )
        interp = interp_result.scalar_one_or_none()
        preview = interp.content[:150] + "..." if interp and len(interp.content) > 150 else (interp.content if interp else None)

        items.append({
            "id": d.id,
            "text": d.text[:200] + "..." if len(d.text) > 200 else d.text,
            "emotion": d.emotion,
            "created_at": d.created_at,
            "author_initials": initials,
            "interpretation_preview": preview,
        })

    return items
