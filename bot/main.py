import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties
from bot.config import settings
from bot.database import init_db
from bot.middlewares.db_middleware import DatabaseMiddleware
from bot.handlers import start, dreams, interpret, payment, gallery, stats


async def main():
    logging.basicConfig(level=logging.INFO)

    bot = Bot(
        token=settings.BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )

    dp = Dispatcher()

    # Register middleware
    dp.message.middleware(DatabaseMiddleware())
    dp.callback_query.middleware(DatabaseMiddleware())

    # Include routers
    dp.include_router(start.router)
    dp.include_router(dreams.router)
    dp.include_router(interpret.router)
    dp.include_router(payment.router)
    dp.include_router(gallery.router)
    dp.include_router(stats.router)

    # Init DB
    await init_db()

    # Start polling
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
