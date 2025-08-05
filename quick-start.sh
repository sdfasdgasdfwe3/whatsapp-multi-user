#!/bin/bash

echo "🚀 Быстрый запуск API сервера..."

# Останавливаем предыдущие процессы
echo "🛑 Остановка предыдущих процессов..."
pkill -f "node.*start-production" 2>/dev/null || true
sleep 2

# Проверяем Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен"
    exit 1
fi

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
npm install

# Проверяем базу данных
echo "📊 Проверка базы данных..."
node -e "
const db = require('./database');
db.initializeDatabase().then(result => {
    if (result) {
        console.log('✅ База данных подключена');
        process.exit(0);
    } else {
        console.log('❌ Ошибка подключения к базе данных');
        process.exit(1);
    }
}).catch(err => {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo "❌ Не удалось подключиться к базе данных"
    exit 1
fi

# Запускаем сервер
echo "🚀 Запуск API сервера..."
nohup node start-production.js > server.log 2>&1 &
SERVER_PID=$!

# Ждем и проверяем
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Сервер запущен (PID: $SERVER_PID)"
    echo "🔗 API: http://89.104.66.62:3001/api/"
    echo "📋 Логи: tail -f server.log"
    echo "🛑 Остановка: kill $SERVER_PID"
else
    echo "❌ Ошибка запуска сервера"
    echo "📋 Проверьте логи: cat server.log"
    exit 1
fi 