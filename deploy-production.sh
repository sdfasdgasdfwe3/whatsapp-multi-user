#!/bin/bash

echo "🚀 Развертывание на продакшен сервере..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Файл package.json не найден. Убедитесь, что вы в корневой папке проекта."
    exit 1
fi

# Останавливаем предыдущие процессы
echo "🛑 Остановка предыдущих процессов..."
pkill -f "node.*start-production.js" || true
pkill -f "node.*server.js" || true
sleep 2

# Проверяем Node.js
echo "📦 Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Устанавливаем..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js версия: $(node --version)"
echo "✅ npm версия: $(npm --version)"

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
npm install

# Проверяем подключение к базе данных
echo "📊 Проверка подключения к базе данных..."
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
    echo "💡 Проверьте настройки в database.js"
    exit 1
fi

# Заполняем базу тестовыми данными
echo "🌱 Заполнение базы данных тестовыми данными..."
node seed-data.js

# Запускаем продакшен сервер
echo "🚀 Запуск продакшен сервера..."
nohup node start-production.js > server.log 2>&1 &
SERVER_PID=$!

# Ждем немного и проверяем, что сервер запустился
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Сервер запущен (PID: $SERVER_PID)"
    echo "📋 Логи сервера: tail -f server.log"
    echo "🔗 API доступен: http://89.104.66.62:3001/api/"
    echo "🧪 Тест API: http://89.104.66.62:3001/api/test"
    echo "📊 Статус БД: http://89.104.66.62:3001/api/db-status"
    echo ""
    echo "👤 Данные для входа:"
    echo "   Администратор: admin / admin123"
    echo "   Пользователь: user / user123"
    echo ""
    echo "🛑 Для остановки сервера: kill $SERVER_PID"
else
    echo "❌ Ошибка запуска сервера"
    echo "📋 Проверьте логи: cat server.log"
    exit 1
fi 