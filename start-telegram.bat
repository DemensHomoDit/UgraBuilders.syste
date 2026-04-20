@echo off
echo ===== ЗАПУСК ИНТЕГРАЦИИ TELEGRAM =====
echo.
echo 1. Запуск проверки и создания необходимых таблиц в базе данных
node create-tables.cjs
echo.

echo 2. Запуск сервера API (на порту 3001)
start cmd /k node server.cjs
timeout /t 3 /nobreak >nul

echo 3. Запуск Telegram-бота
start cmd /k python ugrabuilders_telegram_bot.py
timeout /t 2 /nobreak >nul

echo.
echo ===== СИСТЕМА ЗАПУЩЕНА =====
echo.
echo * Сервер API работает на порту 3001
echo * Telegram-бот запущен
echo * Для привязки Telegram используйте API /api/telegram/generate-token
echo.
pause 