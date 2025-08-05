# 🚀 Инструкции по развертыванию на сервере

## 📋 Требования к серверу

- **ОС:** Ubuntu 18.04+ или CentOS 7+
- **RAM:** Минимум 2GB
- **Диск:** Минимум 10GB свободного места
- **Порты:** 3001 (для приложения), 15657 (для MySQL)

## 🔧 Установка на сервере

### 1. Подключение к серверу
```bash
ssh user@79.174.89.149
```

### 2. Клонирование репозитория
```bash
git clone https://github.com/sdfasdgasdfwe3/whatsapp-multi-user.git
cd whatsapp-multi-user
```

### 3. Установка зависимостей
```bash
# Делаем скрипт исполняемым
chmod +x install-dependencies.sh

# Запускаем установку
./install-dependencies.sh
```

### 4. Настройка базы данных
База данных MySQL уже настроена:
- **Хост:** 79.174.89.149
- **Порт:** 15657
- **Пользователь:** user1
- **Пароль:** dasdfaASDWQ1$
- **База данных:** auth_website

### 5. Заполнение базы данных тестовыми данными
```bash
node seed-data.js
```

### 6. Запуск сервера
```bash
# Запуск в обычном режиме
npm run server

# Запуск в фоновом режиме
nohup npm run server > server.log 2>&1 &

# Проверка логов
tail -f server.log
```

## 🔄 Управление сервером

### Остановка сервера
```bash
# Найти процесс
ps aux | grep node

# Остановить процесс
kill -9 <PID>
```

### Перезапуск сервера
```bash
# Остановить
kill -9 $(ps aux | grep 'node server.js' | grep -v grep | awk '{print $2}')

# Запустить заново
nohup npm run server > server.log 2>&1 &
```

### Обновление кода
```bash
# Получить последние изменения
git pull origin main

# Установить новые зависимости (если есть)
npm install

# Перезапустить сервер
kill -9 $(ps aux | grep 'node server.js' | grep -v grep | awk '{print $2}')
nohup npm run server > server.log 2>&1 &
```

## 📊 Мониторинг

### Проверка статуса сервера
```bash
# Проверка процессов
ps aux | grep node

# Проверка портов
netstat -tlnp | grep :3001

# Проверка логов
tail -f server.log
```

### Проверка базы данных
```bash
# Подключение к MySQL
mysql -h 79.174.89.149 -P 15657 -u user1 -p auth_website

# Проверка таблиц
SHOW TABLES;

# Проверка данных
SELECT * FROM products LIMIT 5;
SELECT * FROM articles LIMIT 5;
SELECT * FROM users LIMIT 5;
```

## 🔒 Безопасность

### Настройка файрвола
```bash
# Открыть порт 3001
sudo ufw allow 3001

# Проверить статус
sudo ufw status
```

### Настройка SSL (опционально)
```bash
# Установка Certbot
sudo apt install certbot

# Получение SSL сертификата
sudo certbot certonly --standalone -d your-domain.com
```

## 🐛 Устранение неполадок

### Проблемы с подключением к базе данных
```bash
# Проверка подключения
telnet 79.174.89.149 15657

# Проверка MySQL
mysql -h 79.174.89.149 -P 15657 -u user1 -p -e "SELECT 1;"
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -tlnp | grep :3001

# Освобождение порта
sudo fuser -k 3001/tcp
```

### Проблемы с зависимостями
```bash
# Очистка кэша npm
npm cache clean --force

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install
```

## 📝 Логи

### Просмотр логов в реальном времени
```bash
tail -f server.log
```

### Поиск ошибок
```bash
grep -i error server.log
grep -i "mysql\|database" server.log
```

## 🔄 Автоматический перезапуск

### Создание systemd сервиса
```bash
sudo nano /etc/systemd/system/whatsapp-server.service
```

Содержимое файла:
```ini
[Unit]
Description=WhatsApp Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/whatsapp-multi-user
ExecStart=/usr/bin/npm run server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Активация сервиса
```bash
sudo systemctl daemon-reload
sudo systemctl enable whatsapp-server
sudo systemctl start whatsapp-server
sudo systemctl status whatsapp-server
```

## 📞 Контакты для поддержки

При возникновении проблем обращайтесь к разработчику. 