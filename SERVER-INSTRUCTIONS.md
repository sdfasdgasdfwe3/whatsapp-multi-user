# 🚀 Инструкции по запуску API сервера на удаленном сервере

## 📍 Текущая ситуация:
- **Сайт работает**: `http://89.104.66.62/` ✅
- **API не работает**: `http://89.104.66.62:3001/api/products` ❌

## 🔧 Шаги для исправления:

### 1. Подключитесь к серверу:
```bash
ssh user@89.104.66.62
```

### 2. Перейдите в папку проекта:
```bash
cd /path/to/your/project
# или
cd ~/auth-website
```

### 3. Остановите все процессы Node.js:
```bash
pkill -f "node.*server"
pkill -f "node.*start-production"
pkill -f "node.*3001"
```

### 4. Проверьте, что порт 3001 свободен:
```bash
netstat -tlnp | grep :3001
```

### 5. Установите зависимости:
```bash
npm install
```

### 6. Проверьте подключение к базе данных:
```bash
node -e "
const db = require('./database');
db.initializeDatabase().then(result => {
    console.log('DB connected:', result);
    process.exit(result ? 0 : 1);
}).catch(err => {
    console.error('DB error:', err.message);
    process.exit(1);
});
"
```

### 7. Запустите продакшен сервер:
```bash
# Вариант 1: Запуск в фоне
nohup node start-production.js > server.log 2>&1 &

# Вариант 2: Запуск с логированием
node start-production.js

# Вариант 3: Через npm
npm run production
```

### 8. Проверьте, что сервер запустился:
```bash
# Проверьте процессы
ps aux | grep node

# Проверьте порт
netstat -tlnp | grep :3001

# Проверьте логи
tail -f server.log
```

### 9. Протестируйте API:
```bash
# Тест сервера
curl http://89.104.66.62:3001/api/test

# Тест базы данных
curl http://89.104.66.62:3001/api/db-status

# Тест продуктов
curl http://89.104.66.62:3001/api/products
```

## 🛠️ Автоматический скрипт:

Если у вас есть доступ к `deploy-production.sh`:
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

## 🔍 Диагностика проблем:

### Если порт занят:
```bash
# Найдите процесс
lsof -i :3001

# Убейте процесс
kill -9 <PID>
```

### Если база данных не подключается:
```bash
# Проверьте MySQL
mysql -h 79.174.89.149 -P 15657 -u user1 -p

# Проверьте настройки в database.js
cat database.js
```

### Если сервер не запускается:
```bash
# Проверьте логи
cat server.log

# Проверьте зависимости
npm list

# Проверьте Node.js
node --version
npm --version
```

## 📋 Команды для управления:

```bash
# Запуск сервера
npm run production

# Остановка сервера
pkill -f "node.*start-production"

# Просмотр логов
tail -f server.log

# Проверка статуса
curl http://89.104.66.62:3001/api/test
```

## ✅ Ожидаемый результат:

После успешного запуска вы должны увидеть:
```
🚀 Запуск продакшен сервера...
📊 Подключение к базе данных...
✅ База данных подключена успешно
✅ Сервер запущен на порту 3001
🌐 API доступен по адресу: http://89.104.66.62:3001/api/
🧪 Тестовый эндпоинт: http://89.104.66.62:3001/api/test
```

## 🎯 Тестирование на сайте:

После запуска сервера:
1. Откройте `http://89.104.66.62/`
2. Войдите в систему
3. Перейдите на страницу продуктов
4. Попробуйте добавить товар

Теперь должно работать без ошибок! 🎉 