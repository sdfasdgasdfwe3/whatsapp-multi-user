# 🚀 Настройка GitHub для автоматического деплоя

## 📋 **Шаг 1: Создание репозитория на GitHub**

1. **Перейдите на GitHub:** https://github.com
2. **Создайте новый репозиторий:**
   - Нажмите "New repository"
   - Название: `whatsapp-multi-user`
   - Описание: `WhatsApp Multi-User System for znam.fun`
   - Выберите "Public" или "Private"
   - **НЕ** добавляйте README, .gitignore или лицензию
   - Нажмите "Create repository"

## 🔐 **Шаг 2: Добавление секретов**

1. **Перейдите в Settings репозитория:**
   - В вашем репозитории нажмите "Settings"

2. **Добавьте секрет `HOSTING_PASSWORD`:**
   - В левом меню выберите "Secrets and variables" → "Actions"
   - Нажмите "New repository secret"
   - **Name:** `HOSTING_PASSWORD`
   - **Value:** `NL3cd9nqp4XGIJ36`
   - Нажмите "Add secret"

## 📤 **Шаг 3: Загрузка кода в GitHub**

1. **Инициализируйте Git в локальной папке:**
   ```bash
   cd auth-website
   git init
   ```

2. **Добавьте все файлы:**
   ```bash
   git add .
   ```

3. **Создайте первый коммит:**
   ```bash
   git commit -m "Initial commit: WhatsApp Multi-User System"
   ```

4. **Добавьте удаленный репозиторий:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/whatsapp-multi-user.git
   ```

5. **Отправьте код:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## ✅ **Шаг 4: Проверка автоматического деплоя**

1. **Перейдите в Actions:**
   - В вашем репозитории нажмите "Actions"

2. **Проверьте статус деплоя:**
   - Должен появиться workflow "Deploy to znam.fun"
   - Нажмите на него для просмотра деталей

3. **Дождитесь завершения:**
   - Зеленый галочка = успешный деплой
   - Красный крестик = ошибка (проверьте логи)

## 🔄 **Шаг 5: Рабочий процесс разработки**

### Для новых функций:

1. **Создайте ветку:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Внесите изменения и закоммитьте:**
   ```bash
   # Внесите изменения в файлы
   git add .
   git commit -m "Add new feature description"
   ```

3. **Отправьте ветку:**
   ```bash
   git push origin feature/new-feature
   ```

4. **Создайте Pull Request:**
   - На GitHub появится предложение создать PR
   - Нажмите "Compare & pull request"
   - Добавьте описание изменений
   - Нажмите "Create pull request"

5. **Слейте изменения:**
   - После проверки нажмите "Merge pull request"
   - Код автоматически деплоится на znam.fun

### Для быстрых исправлений:

1. **Внесите изменения в main:**
   ```bash
   git checkout main
   # Внесите изменения
   git add .
   git commit -m "Quick fix description"
   git push origin main
   ```

2. **Автоматический деплой:**
   - Код автоматически деплоится на znam.fun

## 📊 **Шаг 6: Мониторинг деплоев**

### Проверка статуса:
1. **GitHub Actions:** https://github.com/YOUR_USERNAME/whatsapp-multi-user/actions
2. **Логи деплоя:** Нажмите на workflow → View logs

### Полезные команды:
```bash
# Проверить статус локального репозитория
git status

# Посмотреть историю коммитов
git log --oneline

# Отменить последний коммит (если не отправлен)
git reset --soft HEAD~1

# Синхронизировать с удаленным репозиторием
git pull origin main
```

## 🆘 **Устранение неполадок**

### Проблема: "Permission denied"
```bash
# Настройте SSH ключи или используйте токен
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/whatsapp-multi-user.git
```

### Проблема: "Workflow not found"
- Убедитесь, что файл `.github/workflows/deploy.yml` добавлен в репозиторий
- Проверьте синтаксис YAML файла

### Проблема: "Deployment failed"
1. Проверьте секрет `HOSTING_PASSWORD`
2. Убедитесь, что SSH доступ к серверу работает
3. Проверьте логи в Actions → Deploy to znam.fun

### Проблема: "Server not responding"
```bash
# Подключитесь к серверу и проверьте статус
ssh u3217624@server276.hosting.reg.ru
pm2 status
pm2 logs znam-whatsapp
```

## 🔧 **Дополнительные настройки**

### Настройка уведомлений:
1. В репозитории → Settings → Notifications
2. Настройте уведомления о деплоях

### Настройка защиты ветки main:
1. Settings → Branches
2. Add rule для main
3. Включите "Require pull request reviews"

### Настройка автоматических тестов:
```yaml
# Добавьте в .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm install
    - run: npm test
```

## 📈 **Преимущества GitHub Workflow**

✅ **Автоматический деплой** при каждом push  
✅ **Версионирование** кода  
✅ **История изменений**  
✅ **Откат к предыдущим версиям**  
✅ **Коллаборация** с другими разработчиками  
✅ **Code review** через Pull Requests  
✅ **Бэкапы** кода  
✅ **CI/CD** pipeline  

## 🎯 **Готово!**

Теперь ваш проект:
- ✅ Автоматически деплоится при изменениях
- ✅ Имеет полную историю версий
- ✅ Готов к командной разработке
- ✅ Имеет резервные копии на GitHub

**Сайт будет автоматически обновляться на https://znam.fun при каждом push в main! 🚀** 