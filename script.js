// Данные пользователей (в реальном проекте это должно быть на сервере)
let users = [
    {
        username: 'admin',
        password: '1',
        fullName: 'Администратор',
        phone: '+7 (999) 123-45-67',
        registrationDate: '2024-01-01'
    }
];

// Текущий пользователь
let currentUser = null;

// Глобальные массивы для чатов (объявляем здесь для доступа из всех скриптов)
// Примечание: массивы уже объявлены в chats-script.js, поэтому здесь только ссылки

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, авторизован ли пользователь
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'home.html';
        }
    }
    
    // Инициализация форм
    initializeForms();
    
    // Загрузка данных пользователя на главной странице
    if (window.location.pathname.includes('home.html')) {
        loadUserData();
    }

    // Для всех страниц кроме home.html обновляем имя пользователя в навигации
    if (!window.location.pathname.includes('home.html')) {
        updateUserNameNav();
    }
});

// Инициализация форм
function initializeForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Переключение видимости пароля
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
        } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
        }
        });
});
}

// Обработка входа
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://89.104.66.62:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            showNotification('Успешный вход!', 'success');
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            showNotification('Неверное имя пользователя или пароль!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Ошибка подключения к серверу!', 'error');
    }
}

// Обработка регистрации
async function handleRegister(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Валидация
    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают!', 'error');
        return;
    }
    
    if (password.length < 4) {
        showNotification('Пароль должен содержать минимум 4 символа!', 'error');
        return;
    }
    
    // Генерируем имя пользователя из ФИО
    const username = fullName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
    
    try {
        const response = await fetch('http://89.104.66.62:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, fullName, phone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Регистрация успешна! Ваше имя пользователя: ' + username, 'success');
    setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showNotification(data.error || 'Ошибка регистрации!', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Ошибка подключения к серверу!', 'error');
    }
}

// Выход из системы
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('Вы вышли из системы!', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Загрузка данных пользователя на главной странице
function loadUserData() {
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Обновляем информацию в интерфейсе
    const userNameElements = document.querySelectorAll('#userName');
    userNameElements.forEach(element => {
        element.textContent = currentUser.fullName;
    });
    
    const userFullNameElement = document.getElementById('userFullName');
    if (userFullNameElement) {
        userFullNameElement.textContent = currentUser.fullName;
    }
    
    const userPhoneElement = document.getElementById('userPhone');
    if (userPhoneElement) {
        userPhoneElement.textContent = currentUser.phone;
    }
    
    // Проверяем статус WhatsApp
    checkWhatsAppStatus();
    
    // Проверяем права администратора
    if (currentUser.role === 'admin') {
        showAdminControls();
        showAdminSections();
    }
}

// Обновление имени пользователя в навигации на всех страницах
function updateUserNameNav() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.fullName;
        }
    }
}

// Функция для генерации QR-кода WhatsApp
function generateWhatsAppQR() {
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) {
        // Очищаем контейнер
        qrContainer.innerHTML = '';
        
        // Создаем уникальный QR-код для демонстрации
        const qrData = `https://wa.me/?text=${encodeURIComponent('Привет! Я подключился к WhatsApp Web.')}`;
        
        // Генерируем QR-код
        new QRCode(qrContainer, {
            text: qrData,
            width: 150,
            height: 150,
            colorDark: "#25d366",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Функция для проверки статуса WhatsApp
function checkWhatsAppStatus() {
    // Здесь можно добавить реальную проверку подключения WhatsApp
    const isConnected = Math.random() > 0.5; // Случайный статус для демонстрации
    
    const whatsappStatus = document.getElementById('whatsappStatus');
    const whatsappSetup = document.getElementById('whatsappSetup');
    
    if (isConnected) {
        // Показываем статус подключен
        if (whatsappStatus) {
            whatsappStatus.innerHTML = '<span class="status-connected">Подключен</span>';
        }
        if (whatsappSetup) {
            whatsappSetup.style.display = 'none';
        }
    } else {
        // Показываем карточку подключения с QR-кодом
        if (whatsappStatus) {
            whatsappStatus.innerHTML = '<span class="status-disconnected">Не подключен</span>';
        }
        if (whatsappSetup) {
            whatsappSetup.style.display = 'block';
            // Генерируем QR-код
            setTimeout(() => {
                generateWhatsAppQR();
            }, 100);
        }
    }
}

// Показать уведомление
function showNotification(message, type) {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Валидация номера телефона
function validatePhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// Добавляем валидацию для поля телефона
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                showNotification('Введите корректный номер телефона!', 'error');
            }
        });
    }
});

// Анимация для кнопок
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.auth-btn, .logout-btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});

// Защита от прямого доступа к home.html
if (window.location.pathname.includes('home.html')) {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        window.location.href = 'index.html';
    }
}

// Функции для работы с товарами
function checkAdminRights() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.username === 'admin';
    }
    return false;
}

function showAdminControls() {
    if (checkAdminRights()) {
        const adminControls = document.getElementById('adminControls');
        const productActions = document.querySelectorAll('#productActions');
        
        if (adminControls) {
            adminControls.style.display = 'block';
        }
        
        if (productActions.length > 0) {
            productActions.forEach(action => {
                action.style.display = 'flex';
            });
        }
    }
}

// Показать секции для администраторов
function showAdminSections() {
    const adminSections = document.querySelectorAll('.admin-only');
    adminSections.forEach(section => {
        section.style.display = 'block';
    });
}

function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Очищаем форму
        const form = document.getElementById('addProductForm');
        if (form) {
            form.reset();
        }
    }
}

function editProduct(productId) {
    showNotification('Функция редактирования товара будет добавлена позже', 'success');
}

function deleteProduct(productId) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        showNotification('Товар успешно удален', 'success');
    }
}

// Отправка информации в WhatsApp через API
async function shareToWhatsApp(title, priceOrDate, description) {
    let text = '';
    if (priceOrDate && priceOrDate.includes('₽')) {
        // Товар
        text = `🛍️ *${title}*\n💰 Цена: ${priceOrDate}\n📝 ${description}`;
    } else {
        // Статья
        text = `📰 *${title}*\n📅 Дата: ${priceOrDate}\n📝 ${description}`;
    }
    
    try {
        // Получаем текущего пользователя
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            showNotification('Пользователь не авторизован. Войдите в систему.', 'error');
            return;
        }
        
        // Проверяем статус WhatsApp для пользователя
        const statusResponse = await fetch(`http://89.104.66.62:3001/api/whatsapp/status/${currentUser.id}`);
        const statusData = await statusResponse.json();
        
        if (!statusData.connected) {
            showNotification('WhatsApp не подключен. Сначала подключитесь к WhatsApp.', 'error');
            return;
        }
        
        // Получаем выбранные чаты
        const selectedChats = getSelectedChats();
        
        if (selectedChats.length === 0) {
            showNotification('Выберите хотя бы один чат для отправки. Убедитесь, что вы находитесь на главной странице и подключили WhatsApp.', 'error');
            return;
        }
        
        // Отправляем сообщение в каждый выбранный чат
        let successCount = 0;
        let errorCount = 0;
        
        for (const chatId of selectedChats) {
            try {
                const response = await fetch(`http://89.104.66.62:3001/api/whatsapp/send/${currentUser.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        number: chatId.replace('@c.us', ''),
                        message: text
                    })
                });
                
                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error('Error sending message:', error);
                errorCount++;
            }
        }
        
        if (successCount > 0) {
            showNotification(`Сообщение отправлено в ${successCount} чат(ов)`, 'success');
        }
        
        if (errorCount > 0) {
            showNotification(`Ошибка отправки в ${errorCount} чат(ов)`, 'error');
        }
        
    } catch (error) {
        console.error('Error sharing to WhatsApp:', error);
        showNotification('Ошибка отправки сообщения', 'error');
    }
}

// Функция для получения выбранных чатов
function getSelectedChats() {
    const selectedChats = [];
    
    // Сначала пробуем получить из localStorage (для других страниц)
    const savedSelectedChats = localStorage.getItem('selectedChats');
    if (savedSelectedChats) {
        try {
            const parsed = JSON.parse(savedSelectedChats);
            return parsed;
        } catch (error) {
            console.warn('Error parsing saved chats:', error);
        }
    }
    
    // Проверяем, что массивы доступны
    if (typeof chats === 'undefined' || typeof groups === 'undefined') {
        console.warn('Chats or groups arrays not available yet');
        return selectedChats;
    }
    
    // Получаем выбранные чаты из глобальных массивов
    const selectedChatsFromArray = chats.filter(c => c.selected);
    const selectedGroupsFromArray = groups.filter(g => g.selected);
    
    // Добавляем ID выбранных чатов
    selectedChatsFromArray.forEach(chat => {
        selectedChats.push(chat.id);
    });
    
    // Добавляем ID выбранных групп
    selectedGroupsFromArray.forEach(group => {
        selectedChats.push(group.id);
    });
    
    return selectedChats;
}

// Обработка формы добавления товара
document.addEventListener('DOMContentLoaded', function() {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value;
            const price = document.getElementById('productPrice').value;
            const points = document.getElementById('productPoints').value;
            const description = document.getElementById('productDescription').value;
            const image = document.getElementById('productImage').files[0];
            
            if (!name || !price || !points || !description) {
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
                return;
            }
            
            // Здесь можно добавить логику сохранения товара
            showNotification('Товар успешно добавлен!', 'success');
            closeAddProductModal();
        });
    }
    
    // Закрытие модального окна при клике вне его
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddProductModal();
            }
        });
    }
    
    // Показываем контролы администратора на странице товаров
    if (window.location.pathname.includes('products.html')) {
        showAdminControls();
    }
    
    // Показываем контролы для статей (доступны всем пользователям)
    if (window.location.pathname.includes('articles.html')) {
        showArticleControls();
    }
});

// Функции для работы со статьями
function showArticleControls() {
    const articleActions = document.querySelectorAll('#articleActions');
    if (articleActions.length > 0) {
        articleActions.forEach(action => {
            action.style.display = 'flex';
        });
    }
}

function showAddArticleModal() {
    const modal = document.getElementById('addArticleModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeAddArticleModal() {
    const modal = document.getElementById('addArticleModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Очищаем форму
        const form = document.getElementById('addArticleForm');
        if (form) {
            form.reset();
        }
    }
}

function editArticle(articleId) {
    showNotification('Функция редактирования статьи будет добавлена позже', 'success');
}

function deleteArticle(articleId) {
    if (confirm('Вы уверены, что хотите удалить эту статью?')) {
        showNotification('Статья успешно удалена', 'success');
    }
}

// Обработка формы добавления статьи
document.addEventListener('DOMContentLoaded', function() {
    const addArticleForm = document.getElementById('addArticleForm');
    if (addArticleForm) {
        addArticleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('articleTitle').value;
            const description = document.getElementById('articleDescription').value;
            const image = document.getElementById('articleImage').files[0];
            
            if (!title || !description) {
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
                return;
            }
            
            // Здесь можно добавить логику сохранения статьи
            showNotification('Статья успешно добавлена!', 'success');
            closeAddArticleModal();
        });
    }
    
    // Закрытие модального окна при клике вне его
    const modal = document.getElementById('addArticleModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddArticleModal();
            }
        });
    }
}); 