import asyncio
import aiohttp
from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import Message

API_TOKEN = '7880093516:AAF9uav5P-T0CoyjyoxLMlVXQOC9VgiIi5M'
BACKEND_URL = "http://localhost:3001/api/telegram/bot-link"
API_CHECK_ACCOUNT = "http://localhost:3001/api/telegram/check-account"

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: Message):
    # Парсим аргумент после /start
    if message.text:
        parts = message.text.split(maxsplit=1)
        args = parts[1] if len(parts) > 1 else ""
    else:
        args = ""
    
    if args:
        code = args.strip()
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "token": code,
                    "telegram_user_id": str(message.from_user.id),
                    "username": message.from_user.username or "noname"
                }
                print(f"Отправка запроса на привязку: {payload}")
                
                async with session.post(BACKEND_URL, json=payload) as resp:
                    print(f"Код ответа: {resp.status}")
                    if resp.status == 200:
                        data = await resp.json()
                        if data.get("success"):
                            await message.answer("✅ Telegram успешно привязан к вашему профилю!")
                        else:
                            error_msg = data.get("error", "Неизвестная ошибка")
                            await message.answer(f"❌ Ошибка: {error_msg}\n\nСгенерируйте новую ссылку в личном кабинете.")
            else:
                        text = await resp.text()
                        print(f"Ошибка запроса: {text}")
                        await message.answer("❌ Не удалось подключиться к серверу. Попробуйте позже.")
        except Exception as e:
            print(f"Ошибка при обработке запроса: {e}")
            await message.answer("❌ Произошла ошибка при привязке аккаунта. Попробуйте позже.")
    else:
        # Проверяем, привязан ли аккаунт
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "telegram_user_id": str(message.from_user.id)
                }
                print(f"Проверка привязки для Telegram ID: {message.from_user.id}")
                print(f"URL запроса: {API_CHECK_ACCOUNT}?telegram_user_id={message.from_user.id}")
                
                async with session.get(API_CHECK_ACCOUNT, params=params) as resp:
                    print(f"Код ответа проверки: {resp.status}")
                    
                    # Вывод полного текста ответа для отладки
                    resp_text = await resp.text()
                    print(f"Текст ответа: {resp_text}")
                    
                    if resp.status == 200:
                        try:
                            # Получаем JSON-данные из ответа
                            # Попробуем заново преобразовать текст в JSON для отладки
                            try:
                                import json
                                data = json.loads(resp_text)
                            except Exception as json_parse_error:
                                print(f"Ошибка при ручном парсинге JSON: {json_parse_error}")
                                data = await resp.json()
                                
                            print(f"Данные ответа: {data}")
                            
                            if data.get("linked"):
                                user_info = data.get("user", {})
                                # Пытаемся получить имя пользователя из различных полей
                                username = user_info.get("username")
                                
                                # Отладочная информация
                                print(f"Полные данные пользователя: {user_info}")
                                print(f"Извлеченное имя пользователя: {username}")
                                
                                if not username:
                                    print("Имя пользователя отсутствует, использую запасной вариант")
                                    first_name = user_info.get("first_name")
                                    last_name = user_info.get("last_name")
                                    
                                    if first_name:
                                        username = first_name
                                        if last_name:
                                            username += f" {last_name}"
                                    else:
                                        username = "пользователь"
                                
                                print(f"Аккаунт привязан, пользователь: {username}")
                                
                                # Приветствие по имени, если аккаунт привязан
                                await message.answer(f"👋 Здравствуйте, <b>{username}</b>!\n\n"
                                                  f"Ваш Telegram привязан к аккаунту UgraBuilders.\n\n"
                                                  f"Доступные команды:\n"
                                                  f"/help - Информация о боте\n"
                                                  f"/status - Проверить статус ваших проектов\n"
                                                  f"/notify_off - Отключить уведомления\n"
                                                  f"/notify_on - Включить уведомления\n\n"
                                                  f"Вы будете получать уведомления о важных событиях: изменении статусов проектов, новых документах и т.д.",
                                                  parse_mode="HTML")
                                return
                            else:
                                print("Аккаунт не привязан")
                        except Exception as json_error:
                            print(f"Ошибка при обработке JSON: {json_error}")
                    else:
                        print(f"Ошибка запроса: {resp.status}")
                        
            # Если аккаунт не привязан или произошла ошибка, выводим стандартное приветствие
            await message.answer("👋 Добро пожаловать в бот UgraBuilders!\n\n"
                               "Этот бот отправляет уведомления о:\n"
                               "• Изменениях статуса проектов\n"
                               "• Смене этапов продажи\n"
                               "• Новых документах\n"
                               "• Задачах по строительству\n\n"
                               "Для привязки аккаунта используйте ссылку из личного кабинета на сайте UgraBuilders.ru.")
        except Exception as e:
            print(f"Ошибка при проверке привязки аккаунта: {e}")
            await message.answer("👋 Добро пожаловать в бот UgraBuilders!\n\n"
                               "Этот бот отправляет уведомления о:\n"
                               "• Изменениях статуса проектов\n"
                               "• Смене этапов продажи\n"
                               "• Новых документах\n"
                               "• Задачах по строительству\n\n"
                               "Для привязки аккаунта используйте ссылку из личного кабинета на сайте UgraBuilders.ru.")

@dp.message(Command("help"))
async def help_command(message: Message):
    await message.answer("📚 Справка по боту UgraBuilders\n\n"
                       "Команды:\n"
                       "/start - Начало работы\n"
                       "/help - Эта справка\n"
                       "/status - Проверить статус ваших проектов\n"
                       "/notify_off - Отключить уведомления\n"
                       "/notify_on - Включить уведомления\n\n"
                       "Чтобы получать уведомления, привяжите бот через личный кабинет на сайте UgraBuilders.ru.\n\n"
                       "По всем вопросам обращайтесь в службу поддержки.")

# Заглушка для новых команд
@dp.message(Command("status"))
async def status_command(message: Message):
    await message.answer("⏳ Функция проверки статуса проектов находится в разработке и будет доступна вскоре.")

@dp.message(Command("notify_off"))
async def notify_off_command(message: Message):
    await message.answer("⏳ Функция отключения уведомлений находится в разработке и будет доступна вскоре.")

@dp.message(Command("notify_on"))
async def notify_on_command(message: Message):
    await message.answer("⏳ Функция включения уведомлений находится в разработке и будет доступна вскоре.")

# Обработка всех остальных сообщений
@dp.message()
async def echo(message: Message):
    await message.answer("Извините, я понимаю только команды. Воспользуйтесь /help для получения списка команд.")

async def main():
    print("Запуск Telegram-бота UgraBuilders...")
    
    try:
        print(f"Бот @{(await bot.get_me()).username} запущен!")
        await dp.start_polling(bot)
    except Exception as e:
        print(f"Ошибка при запуске бота: {e}")

if __name__ == "__main__":
    asyncio.run(main())