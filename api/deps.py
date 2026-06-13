import hashlib
import hmac
import json
import logging
from urllib.parse import unquote, parse_qsl

from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from bot.config import settings
from bot.database.models import User
from .database import get_db

logger = logging.getLogger(__name__)


def verify_telegram_init_data(init_data: str) -> dict:
    """Verify Telegram WebApp initData and return user info."""
    try:
        parsed = dict(parse_qsl(unquote(init_data), keep_blank_values=True))
        check_string = parsed.pop("hash", "")
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed.items())
        )
        secret_key = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
        computed = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if not hmac.compare_digest(computed, check_string):
            raise ValueError("Invalid hash")

        user_data = json.loads(parsed.get("user", "{}"))
        return user_data
    except Exception as e:
        logger.warning("initData verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Unauthorized")


async def get_current_user(
    x_init_data: str = Header(default=""),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not x_init_data:
        raise HTTPException(status_code=401, detail="Missing init data")

    user_data = verify_telegram_init_data(x_init_data)
    if not user_data.get("id"):
        raise HTTPException(status_code=401, detail="No user in init data")

    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == user_data["id"]))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=user_data["id"],
            username=user_data.get("username"),
            first_name=user_data.get("first_name", ""),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
