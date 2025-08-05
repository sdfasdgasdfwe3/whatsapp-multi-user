#!/bin/bash

echo "🚀 Быстрое развертывание WhatsApp сервера..."

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Устанавливаем..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не установлен. Устанавливаем..."
    sudo apt-get install -y npm
fi

echo "✅ Node.js и npm установлены:"
node --version
npm --version

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости проекта..."
npm install

# Проверяем подключение к базе данных
echo "🔍 Проверяем подключение к базе данных..."
node -e "
const mysql = require('mysql2/promise');
const config = {
    host: '79.174.89.149',
    port: 15657,
    user: 'user1',
    password: 'dasdfaASDWQ1$',
    database: 'auth_website'
};

async function testConnection() {
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Подключение к базе данных успешно');
        await connection.end();
    } catch (error) {
        console.log('❌ Ошибка подключения к базе данных:', error.message);
        process.exit(1);
    }
}

testConnection();
"

# Заполняем базу данных тестовыми данными
echo "🌱 Заполняем базу данных тестовыми данными..."
node seed-data.js

# Проверяем, что сервер не запущен
echo "🛑 Останавливаем предыдущие процессы..."
pkill -f "node server.js" || true

# Запускаем сервер
echo "🚀 Запускаем сервер..."
nohup npm run server > server.log 2>&1 &

# Ждем немного и проверяем статус
sleep 3

echo "📊 Статус сервера:"
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Сервер запущен успешно"
    echo "📝 Логи: tail -f server.log"
    echo "🌐 Сайт доступен по адресу: http://localhost:3001"
else
    echo "❌ Ошибка запуска сервера"
    echo "📝 Проверьте логи: cat server.log"
fi

echo ""
echo "📋 Данные для входа:"
echo "👤 Администратор: admin / admin123"
echo "👤 Пользователь: user / user123"
echo ""
echo "🎉 Развертывание завершено!" 