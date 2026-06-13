from datetime import date
from typing import Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from .models import Dream, Interpretation, Payment, User


async def get_or_create_user(
    session: AsyncSession,
    telegram_id: int,
    username: Optional[str],
    first_name: str,
) -> User:
    result = await session.execute(select(User).where(User.id == telegram_id))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(id=telegram_id, username=username, first_name=first_name)
        session.add(user)
        await session.commit()
        await session.refresh(user)
    return user


async def get_user(session: AsyncSession, telegram_id: int) -> Optional[User]:
    result = await session.execute(select(User).where(User.id == telegram_id))
    return result.scalar_one_or_none()


async def update_user(session: AsyncSession, user_id: int, **kwargs) -> None:
    await session.execute(update(User).where(User.id == user_id).values(**kwargs))
    await session.commit()


async def create_dream(
    session: AsyncSession,
    user_id: int,
    text: str,
    emotion: str,
) -> Dream:
    dream = Dream(user_id=user_id, text=text, emotion=emotion)
    session.add(dream)
    await session.commit()
    await session.refresh(dream)
    return dream


async def get_dream(session: AsyncSession, dream_id: int) -> Optional[Dream]:
    result = await session.execute(select(Dream).where(Dream.id == dream_id))
    return result.scalar_one_or_none()


async def get_user_dreams(
    session: AsyncSession,
    user_id: int,
    limit: int = 20,
    offset: int = 0,
) -> list[Dream]:
    result = await session.execute(
        select(Dream)
        .where(Dream.user_id == user_id)
        .order_by(Dream.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def create_interpretation(
    session: AsyncSession,
    dream_id: int,
    type: str,
    content: str,
    is_premium: bool = False,
) -> Interpretation:
    interp = Interpretation(
        dream_id=dream_id,
        type=type,
        content=content,
        is_premium=is_premium,
    )
    session.add(interp)
    await session.commit()
    await session.refresh(interp)
    return interp


async def get_dream_interpretations(
    session: AsyncSession,
    dream_id: int,
) -> list[Interpretation]:
    result = await session.execute(
        select(Interpretation)
        .where(Interpretation.dream_id == dream_id)
        .order_by(Interpretation.created_at.asc())
    )
    return list(result.scalars().all())


async def create_payment(
    session: AsyncSession,
    user_id: int,
    provider: str,
    amount: int,
    payload: str,
) -> Payment:
    payment = Payment(
        user_id=user_id,
        provider=provider,
        amount=amount,
        payload=payload,
        status="pending",
    )
    session.add(payment)
    await session.commit()
    await session.refresh(payment)
    return payment


async def update_payment_status(
    session: AsyncSession,
    payment_id: int,
    status: str,
) -> None:
    await session.execute(
        update(Payment).where(Payment.id == payment_id).values(status=status)
    )
    await session.commit()


async def get_public_dreams(
    session: AsyncSession,
    limit: int = 50,
    offset: int = 0,
) -> list[Dream]:
    result = await session.execute(
        select(Dream)
        .options(joinedload(Dream.user))
        .where(Dream.is_public.is_(True))
        .order_by(Dream.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def increment_free_interpretations(
    session: AsyncSession,
    user: User,
) -> User:
    today = date.today()
    if user.last_interpretation_date != today:
        user.free_interpretations_today = 0
        user.last_interpretation_date = today
    user.free_interpretations_today += 1
    await session.execute(
        update(User)
        .where(User.id == user.id)
        .values(
            free_interpretations_today=user.free_interpretations_today,
            last_interpretation_date=user.last_interpretation_date,
        )
    )
    await session.commit()
    return user


async def get_user_dream_count(session: AsyncSession, user_id: int) -> int:
    result = await session.execute(
        select(func.count(Dream.id)).where(Dream.user_id == user_id)
    )
    return result.scalar_one()


async def get_user_stats(session: AsyncSession, user_id: int) -> dict:
    total_dreams = await get_user_dream_count(session, user_id)

    emotions_result = await session.execute(
        select(Dream.emotion, func.count(Dream.id).label("cnt"))
        .where(Dream.user_id == user_id)
        .group_by(Dream.emotion)
    )
    emotions_breakdown: dict[str, int] = {
        row.emotion: row.cnt for row in emotions_result.all()
    }

    user = await get_user(session, user_id)
    streak = user.streak_days if user else 0

    return {
        "total_dreams": total_dreams,
        "emotions": emotions_breakdown,
        "streak": streak,
    }
