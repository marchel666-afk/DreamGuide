from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date

from bot.database.models import User, Dream, Interpretation
from bot.services.ai_service import interpret_dream
from bot.config import settings
from api.database import get_db
from api.deps import get_current_user
from api.schemas import DreamOut, DreamCreate, InterpretationOut, InterpretationCreate

router = APIRouter(prefix="/dreams", tags=["dreams"])


@router.get("", response_model=list[DreamOut])
async def list_dreams(
    page: int = 1,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    limit = 20
    offset = (page - 1) * limit
    result = await db.execute(
        select(Dream)
        .where(Dream.user_id == user.id)
        .order_by(Dream.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    dreams = result.scalars().all()
    out = []
    for d in dreams:
        interps_result = await db.execute(
            select(Interpretation).where(Interpretation.dream_id == d.id)
        )
        interps = interps_result.scalars().all()
        dream_dict = {
            "id": d.id,
            "user_id": d.user_id,
            "text": d.text,
            "emotion": d.emotion,
            "created_at": d.created_at,
            "is_public": d.is_public,
            "interpretations": [
                {
                    "id": i.id,
                    "dream_id": i.dream_id,
                    "type": i.type,
                    "content": i.content,
                    "is_premium": i.is_premium,
                    "created_at": i.created_at,
                }
                for i in interps
            ],
        }
        out.append(dream_dict)
    return out


@router.get("/{dream_id}", response_model=DreamOut)
async def get_dream(
    dream_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dream).where(Dream.id == dream_id, Dream.user_id == user.id))
    dream = result.scalar_one_or_none()
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")

    interps_result = await db.execute(select(Interpretation).where(Interpretation.dream_id == dream_id))
    interps = interps_result.scalars().all()
    return {
        "id": dream.id,
        "user_id": dream.user_id,
        "text": dream.text,
        "emotion": dream.emotion,
        "created_at": dream.created_at,
        "is_public": dream.is_public,
        "interpretations": [
            {"id": i.id, "dream_id": i.dream_id, "type": i.type,
             "content": i.content, "is_premium": i.is_premium, "created_at": i.created_at}
            for i in interps
        ],
    }


@router.post("", response_model=DreamOut)
async def create_dream(
    data: DreamCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dream = Dream(user_id=user.id, text=data.text, emotion=data.emotion)
    db.add(dream)

    # Update streak
    today = date.today()
    from datetime import timedelta
    if user.last_dream_date is None or user.last_dream_date < today:
        if user.last_dream_date == today - timedelta(days=1):
            user.streak_days += 1
        elif user.last_dream_date != today:
            user.streak_days = 1
        user.last_dream_date = today

    await db.commit()
    await db.refresh(dream)
    return {
        "id": dream.id, "user_id": dream.user_id, "text": dream.text,
        "emotion": dream.emotion, "created_at": dream.created_at,
        "is_public": dream.is_public, "interpretations": [],
    }


@router.post("/{dream_id}/interpret", response_model=InterpretationOut)
async def interpret_dream_route(
    dream_id: int,
    data: InterpretationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dream).where(Dream.id == dream_id, Dream.user_id == user.id))
    dream = result.scalar_one_or_none()
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")

    # Check free limit
    today = date.today()
    if user.last_interpretation_date != today:
        user.free_interpretations_today = 0
        user.last_interpretation_date = today

    is_premium_action = False
    if not user.is_premium and user.free_interpretations_today >= settings.FREE_INTERPRETATIONS_PER_DAY:
        raise HTTPException(status_code=402, detail="Free limit reached. Purchase Stars to continue.")

    content = await interpret_dream(dream.text, dream.emotion, data.type)

    if not user.is_premium:
        user.free_interpretations_today += 1

    interp = Interpretation(
        dream_id=dream_id,
        type=data.type,
        content=content,
        is_premium=is_premium_action,
    )
    db.add(interp)
    await db.commit()
    await db.refresh(interp)
    return {
        "id": interp.id, "dream_id": interp.dream_id, "type": interp.type,
        "content": interp.content, "is_premium": interp.is_premium, "created_at": interp.created_at,
    }


@router.patch("/{dream_id}/toggle-public", response_model=DreamOut)
async def toggle_public(
    dream_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Dream).where(Dream.id == dream_id, Dream.user_id == user.id))
    dream = result.scalar_one_or_none()
    if not dream:
        raise HTTPException(status_code=404, detail="Dream not found")
    dream.is_public = not dream.is_public
    await db.commit()
    return {
        "id": dream.id, "user_id": dream.user_id, "text": dream.text,
        "emotion": dream.emotion, "created_at": dream.created_at,
        "is_public": dream.is_public, "interpretations": [],
    }
