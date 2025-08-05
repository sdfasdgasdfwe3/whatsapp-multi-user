# 🚀 WhatsApp Multi-User System

Система для отправки сообщений в WhatsApp с поддержкой множественных пользователей и индивидуальными аккаунтами.

## 🌟 **Возможности**

- ✅ **Индивидуальные WhatsApp клиенты** для каждого пользователя
- ✅ **Регистрация новых пользователей** на сайте
- ✅ **Автоматическая авторизация** после регистрации
- ✅ **Изолированные чаты** - каждый видит только свои контакты
- ✅ **Персональные QR-коды** для подключения WhatsApp
- ✅ **Автоматический деплой** через GitHub Actions

## 🚀 **Быстрый старт**

### Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/your-username/whatsapp-multi-user.git
   cd whatsapp-multi-user
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Запустите сервер:**
   ```bash
   npm run server-multi
   ```

4. **Откройте сайт:** http://localhost:3001

### Деплой на хостинг

#### Автоматический деплой через GitHub

1. **Создайте репозиторий на GitHub**
2. **Добавьте секрет `HOSTING_PASSWORD`:**
   - Перейдите в Settings → Secrets and variables → Actions
   - Добавьте секрет `HOSTING_PASSWORD` со значением `NL3cd9nqp4XGIJ36`

3. **Загрузите код в GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

4. **Автоматический деплой:**
   - При каждом push в ветку `main` код автоматически деплоится на znam.fun
   - Проверьте статус в Actions → Deploy to znam.fun

#### Ручной деплой

Следуйте инструкции в файле `QUICK-DEPLOY.md`

## 📁 **Структура проекта**

```
├── .github/workflows/     # GitHub Actions
├── index.html             # Главная страница
├── home.html              # Домашняя страница
├── products.html          # Страница товаров
├── articles.html          # Страница статей
├── script.js              # Основной JavaScript
├── chats-script.js        # WhatsApp интеграция
├── server-multi.js        # Сервер для множественных пользователей
├── database.json          # База данных пользователей
├── package.json           # Зависимости
└── README.md              # Документация
```

## 🔧 **API Endpoints**

### Аутентификация
- `POST /api/auth/login` - Вход пользователя
- `POST /api/auth/register` - Регистрация пользователя

### WhatsApp
- `GET /api/whatsapp/status/:userId` - Статус подключения
- `GET /api/whatsapp/qr/:userId` - QR-код для подключения
- `GET /api/whatsapp/chats/:userId` - Список чатов
- `POST /api/whatsapp/send/:userId` - Отправка сообщения
- `POST /api/whatsapp/disconnect/:userId` - Отключение

### Статистика
- `GET /api/messages/stats/:userId` - Статистика сообщений

## 👥 **Пользователи по умолчанию**

- **admin** / **1** - Администратор
- **user1** / **123** - Тестовый пользователь 1
- **user2** / **123** - Тестовый пользователь 2

## 🔄 **Рабочий процесс с GitHub**

### Разработка

1. **Создайте ветку для новой функции:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Внесите изменения и закоммитьте:**
   ```bash
   git add .
   git commit -m "Add new feature"
   ```

3. **Отправьте изменения:**
   ```bash
   git push origin feature/new-feature
   ```

4. **Создайте Pull Request** для слияния в `main`

### Деплой

- **Автоматический:** При push в `main` → автоматический деплой на znam.fun
- **Ручной:** В GitHub → Actions → Deploy to znam.fun → Run workflow

## 📊 **Мониторинг**

### Локально
```bash
# Проверить статус сервера
npm run server-multi

# Посмотреть логи
tail -f logs/app.log
```

### На хостинге
```bash
# Подключиться к серверу
ssh u3217624@server276.hosting.reg.ru

# Проверить статус
pm2 status

# Посмотреть логи
pm2 logs znam-whatsapp

# Мониторинг ресурсов
pm2 monit
```

## 🆘 **Устранение неполадок**

### Проблемы с деплоем
1. Проверьте GitHub Actions → Deploy to znam.fun
2. Убедитесь, что секрет `HOSTING_PASSWORD` добавлен
3. Проверьте логи деплоя

### Проблемы с сервером
1. Проверьте логи: `pm2 logs znam-whatsapp`
2. Перезапустите: `pm2 restart znam-whatsapp`
3. Проверьте порт 3001

### Проблемы с WhatsApp
1. Убедитесь, что интернет-соединение работает
2. Проверьте QR-код на главной странице
3. Переподключите WhatsApp через отключение/подключение

## 📈 **Производительность**

**Рекомендуемые требования для 15 пользователей:**
- **CPU:** 2.2 ГГц (достаточно для 10-12 одновременных клиентов)
- **RAM:** 8+ ГБ
- **Диск:** 50 ГБ SSD

## 🤝 **Вклад в проект**

1. Форкните репозиторий
2. Создайте ветку для вашей функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 **Лицензия**

MIT License

---

**Сайт:** https://znam.fun  
**GitHub:** https://github.com/your-username/whatsapp-multi-user 