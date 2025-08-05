#!/bin/bash

echo "🚀 Установка зависимостей на сервере..."

# Обновляем список пакетов
echo "📦 Обновление списка пакетов..."
sudo apt update

# Устанавливаем Node.js и npm если их нет
if ! command -v node &> /dev/null; then
    echo "📥 Установка Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Проверяем версии
echo "✅ Версии установленных компонентов:"
node --version
npm --version

# Устанавливаем зависимости проекта
echo "📦 Установка зависимостей проекта..."
npm install

# Проверяем установленные зависимости
echo "✅ Проверка установленных зависимостей:"
npm list --depth=0

echo "🎉 Установка завершена!"
echo "🚀 Для запуска сервера используйте: npm run server" 