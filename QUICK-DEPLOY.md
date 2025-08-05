# 🚀 Быстрое развертывание на znam.fun

## 📋 **Ваши данные:**
- **Домен:** znam.fun
- **Хостинг:** server276.hosting.reg.ru
- **Панель:** https://server276.hosting.reg.ru:1500/
- **Логин:** u3217624
- **Пароль:** NL3cd9nqp4XGIJ36

## ⚡ **Быстрые шаги:**

### 1️⃣ **Подготовка файлов**
```bash
# Создайте архив проекта
zip -r znam-fun-whatsapp.zip . -x "node_modules/*" ".wwebjs_auth/*" ".wwebjs_cache/*"
```

### 2️⃣ **Загрузка на хостинг**
1. Войдите в панель управления: https://server276.hosting.reg.ru:1500/
2. Перейдите в **"Файловый менеджер"**
3. Откройте папку `/domains/znam.fun/public_html/`
4. Загрузите и распакуйте архив

### 3️⃣ **Установка через SSH**
```bash
# Подключитесь к серверу
ssh u3217624@server276.hosting.reg.ru

# Перейдите в папку сайта
cd /home/u3217624/domains/znam.fun/public_html

# Установите зависимости
npm install

# Создайте файл конфигурации PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'znam-whatsapp',
    script: 'server-multi.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Установите PM2
npm install -g pm2

# Запустите сервер
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4️⃣ **Настройка прокси**
В панели управления:
1. Перейдите в **"Домены"** → **znam.fun**
2. Настройте **прокси** для `/api/` → `http://localhost:3001/api/`
3. Включите **SSL сертификат**

### 5️⃣ **Проверка работы**
1. Откройте https://znam.fun
2. Войдите как `admin` / `1`
3. Подключите WhatsApp через QR-код
4. Протестируйте отправку сообщений

## 🔧 **Полезные команды:**

```bash
# Проверить статус сервера
pm2 status

# Посмотреть логи
pm2 logs znam-whatsapp

# Перезапустить сервер
pm2 restart znam-whatsapp

# Мониторинг ресурсов
pm2 monit
```

## 🆘 **Если что-то не работает:**

1. **Проверьте логи:** `pm2 logs znam-whatsapp`
2. **Перезапустите:** `pm2 restart znam-whatsapp`
3. **Проверьте порт:** убедитесь, что порт 3001 открыт
4. **Проверьте прокси:** в панели управления

**Готово! Ваш WhatsApp сервер будет доступен на https://znam.fun 🎉** 