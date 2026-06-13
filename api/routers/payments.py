from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.database.models import User
from api.database import get_db
from api.deps import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/prices")
async def get_prices(user: User = Depends(get_current_user)):
    return settings.PRICES


@router.post("/yookassa/webhook")
async def yookassa_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle YooKassa payment notifications."""
    from sqlalchemy import select
    from bot.database.models import Payment

    data = await request.json()
    event = data.get("event", "")
    payment_obj = data.get("object", {})

    if event == "payment.succeeded":
        payment_id = payment_obj.get("id")
        metadata = payment_obj.get("metadata", {})
        user_id = metadata.get("user_id")
        payload = metadata.get("payload", "")

        result = await db.execute(
            select(Payment).where(Payment.user_id == user_id, Payment.payload == payload, Payment.provider == "yookassa")
        )
        payment = result.scalar_one_or_none()
        if payment:
            payment.status = "success"
            await db.commit()

        if payload == "premium_month" and user_id:
            from datetime import datetime, timedelta
            user_result = await db.execute(select(User).where(User.id == int(user_id)))
            u = user_result.scalar_one_or_none()
            if u:
                u.is_premium = True
                u.premium_until = datetime.utcnow() + timedelta(days=30)
                await db.commit()

    return {"status": "ok"}
