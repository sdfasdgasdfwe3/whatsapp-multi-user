# 🚀 Инструкция по развертыванию на хостинг

## 📋 **Данные хостинга:**

**Сервер:** server276.hosting.reg.ru  
**IP:** 37.140.192.181  
**Панель управления:** https://server276.hosting.reg.ru:1500/  
**Логин:** u3217624  
**Пароль:** NL3cd9nqp4XGIJ36  

**База данных MySQL:**
- Логин: u3217624_default
- Пароль: 5ID35vgJb8UEisla
- База данных: u3217624_default
- Host: localhost

## 🔧 **Шаг 1: Подготовка файлов**

1. **Создайте архив проекта:**
   ```bash
   zip -r whatsapp-multi-user.zip . -x "node_modules/*" ".wwebjs_auth/*" ".wwebjs_cache/*"
   ```

2. **Исключите из архива:**
   - `node_modules/` (установим на сервере)
   - `.wwebjs_auth/` (сессии WhatsApp)
   - `.wwebjs_cache/` (кэш WhatsApp)

## 🌐 **Шаг 2: Загрузка на хостинг**

1. **Войдите в панель управления:** https://server276.hosting.reg.ru:1500/
2. **Логин:** u3217624
3. **Пароль:** NL3cd9nqp4XGIJ36

## 📁 **Шаг 3: Создание домена**

1. В панели управления перейдите в **"Домены"**
2. Создайте новый домен или используйте поддомен
3. Настройте **PHP 8.1** или выше
4. Включите **Node.js**

## 🔧 **Шаг 4: Загрузка файлов**

1. **Через SFTP:**
   - Хост: server276.hosting.reg.ru
   - Порт: 22
   - Логин: u3217624
   - Пароль: NL3cd9nqp4XGIJ36

2. **Или через панель управления:**
   - Загрузите архив в корневую папку сайта
   - Распакуйте файлы

## 📦 **Шаг 5: Установка зависимостей**

1. **Подключитесь по SSH:**
   ```bash
   ssh u3217624@server276.hosting.reg.ru
   ```

2. **Перейдите в папку сайта:**
   ```bash
   cd /home/u3217624/domains/znam.fun/public_html
   ```

3. **Установите Node.js зависимости:**
   ```bash
   npm install
   ```

## ⚙️ **Шаг 6: Настройка базы данных**

1. **Создайте базу данных MySQL:**
   - Логин: u3217624_default
   - Пароль: 5ID35vgJb8UEisla
   - База данных: u3217624_default

2. **Импортируйте структуру:**
   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(50) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       fullName VARCHAR(100) NOT NULL,
       phone VARCHAR(20),
       role ENUM('admin', 'user') DEFAULT 'user',
       whatsappSession JSON,
       createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE messages (
       id BIGINT PRIMARY KEY,
       userId INT NOT NULL,
       number VARCHAR(20) NOT NULL,
       message TEXT NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (userId) REFERENCES users(id)
   );

   -- Добавьте тестовых пользователей
   INSERT INTO users (username, password, fullName, phone, role) VALUES
   ('admin', '1', 'Администратор', '+7 (999) 123-45-67', 'admin'),
   ('user1', '123', 'Иван Петров', '+7 (999) 111-22-33', 'user'),
   ('user2', '123', 'Мария Сидорова', '+7 (999) 444-55-66', 'user');
   ```

## 🔧 **Шаг 7: Настройка сервера**

1. **Создайте файл конфигурации:**
   ```bash
   nano ecosystem.config.js
   ```

2. **Добавьте конфигурацию PM2:**
   ```javascript
   module.exports = {
     apps: [{
       name: 'whatsapp-multi',
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
   ```

## 🚀 **Шаг 8: Запуск сервера**

1. **Установите PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Запустите сервер:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🔒 **Шаг 9: Настройка безопасности**

1. **Создайте .htaccess для защиты:**
   ```apache
   # Защита от прямого доступа к файлам
   <Files "database.json">
       Order allow,deny
       Deny from all
   </Files>
   
   <Files "server-multi.js">
       Order allow,deny
       Deny from all
   </Files>
   ```

2. **Настройте SSL сертификат** (бесплатно от Let's Encrypt)

## 📊 **Шаг 10: Мониторинг**

1. **Проверьте статус:**
   ```bash
   pm2 status
   pm2 logs whatsapp-multi
   ```

2. **Настройте мониторинг ресурсов:**
   ```bash
   pm2 monit
   ```

## 🔧 **Шаг 11: Настройка домена**

1. **Создайте поддомен для API:**
   - api.znam.fun → порт 3001

2. **Настройте прокси в панели управления:**
   ```
   Location: /api/
   Proxy: http://localhost:3001/api/
   ```

## ✅ **Шаг 12: Тестирование**

1. **Откройте сайт:** https://znam.fun
2. **Войдите как admin:** логин `admin`, пароль `1`
3. **Или зарегистрируйтесь** как новый пользователь
4. **Подключите WhatsApp** через QR-код
5. **Протестируйте отправку сообщений**

## 🆕 **Новые возможности:**

### ✅ **Регистрация пользователей:**
- Новые пользователи могут регистрироваться на сайте
- Автоматическая генерация имени пользователя
- Проверка уникальности имени пользователя
- Сохранение в базу данных

### ✅ **Индивидуальные аккаунты:**
- Каждый пользователь имеет свой WhatsApp клиент
- Изолированные чаты и сообщения
- Персональные QR-коды для подключения

### ✅ **Безопасность:**
- Пароли хранятся в базе данных
- Автоматическая авторизация после регистрации
- Защита от дублирования пользователей

## 📈 **Мониторинг производительности**

**Для 15 пользователей на Host-B:**
- **CPU:** 2.2 ГГц (достаточно для 10-12 одновременных клиентов)
- **RAM:** Рекомендуется 8+ ГБ
- **Диск:** 50 ГБ SSD (хватит на 15 пользователей)

## 🔧 **Оптимизация для хостинга:**

1. **Ограничьте одновременных пользователей:**
   ```javascript
   const MAX_CONCURRENT_USERS = 10;
   ```

2. **Настройте автоперезапуск при ошибках:**
   ```javascript
   pm2 restart whatsapp-multi --max-memory-restart 1G
   ```

3. **Мониторинг логов:**
   ```bash
   pm2 logs whatsapp-multi --lines 100
   ```

## 🆘 **Устранение неполадок:**

1. **Сервер не запускается:**
   ```bash
   pm2 delete whatsapp-multi
   pm2 start ecosystem.config.js
   ```

2. **WhatsApp клиенты не подключаются:**
   - Проверьте интернет-соединение
   - Убедитесь, что порт 3001 открыт
   - Проверьте логи: `pm2 logs whatsapp-multi`

3. **Высокая нагрузка на CPU:**
   - Ограничьте количество одновременных клиентов
   - Настройте автоперезапуск при превышении памяти

4. **Проблемы с регистрацией:**
   - Проверьте подключение к базе данных
   - Убедитесь, что таблица `users` создана
   - Проверьте права доступа к файлу `database.json`

## 📞 **Поддержка:**

При возникновении проблем:
1. Проверьте логи: `pm2 logs whatsapp-multi`
2. Мониторинг ресурсов: `pm2 monit`
3. Перезапуск сервера: `pm2 restart whatsapp-multi`

**Успешного развертывания! 🚀** 