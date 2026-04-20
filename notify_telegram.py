import requests
import asyncpg
import os
import asyncio

API_TOKEN = '7880093516:AAF9uav5P-T0CoyjyoxLMlVXQOC9VgiIi5M'
SUPABASE_DSN = os.getenv("SUPABASE_DSN")

# Отправка сообщения в Telegram
def send_telegram_message(telegram_user_id, text, bot_token=API_TOKEN):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {"chat_id": telegram_user_id, "text": text}
    requests.post(url, data=data)

# Асинхронная функция для уведомления всех Telegram-аккаунтов пользователя
async def notify_user(user_id, text):
    pool = await asyncpg.create_pool(dsn=SUPABASE_DSN)
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT telegram_user_id FROM user_telegram_accounts WHERE user_id=$1", user_id)
        for row in rows:
            send_telegram_message(row['telegram_user_id'], text)
    await pool.close()

# Пример использования
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python notify_telegram.py <user_id> <message>")
        exit(1)
    user_id = sys.argv[1]
    message = sys.argv[2]
    asyncio.run(notify_user(user_id, message)) 