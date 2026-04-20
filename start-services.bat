@echo off
echo Запуск сервисов Telegram-интеграции...

:: Запуск backend-сервера
start cmd /k "node server.cjs"

:: Запуск Telegram-бота
start cmd /k "python ugrabuilders_telegram_bot.py"

:: Создание тестовых данных в Supabase
echo Создание тестовой привязки Telegram-аккаунта...
node test-connection.js

echo Все сервисы запущены!
echo.
echo Для отправки тестового уведомления используйте:
echo curl -X POST http://localhost:3001/api/telegram/notify -H "Content-Type: application/json" -d "{\"message\":\"Тестовое уведомление\"}"
echo.
echo или запустите:
echo node send-notification.js 