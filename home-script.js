// Проверка авторизации
function checkAuth() {
    // В реальном приложении здесь была бы проверка токена или сессии
    // Для демо просто проверяем, есть ли данные в localStorage
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        window.location.href = 'index.html';
        return;
    }
    
    // Отображаем информацию о пользователе
    displayUserInfo(JSON.parse(currentUser));
}

// Отображение информации о пользователе
function displayUserInfo(user) {
    // Данные пользователя больше не отображаются
}

// Функция выхода
function logout() {
    // Показываем подтверждение
    if (confirm('Вы уверены, что хотите выйти?')) {
        // Удаляем данные пользователя
        localStorage.removeItem('currentUser');
        
        // Показываем сообщение об успешном выходе
        showMessage('Вы успешно вышли из системы', 'success');
        
        // Перенаправляем на страницу входа через 1.5 секунды
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Показ сообщений
function showMessage(message, type) {
    // Удаляем предыдущие сообщения
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Создаем новое сообщение
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Добавляем стили для сообщения
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#4CAF50';
    } else {
        messageDiv.style.background = '#f44336';
    }
    
    document.body.appendChild(messageDiv);
    
    // Удаляем сообщение через 3 секунды
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 3000);
}

// Добавляем CSS анимации для сообщений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Обработчики для навигации
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию при загрузке страницы
    checkAuth();
    

    

});

// Обработка нажатия клавиши Escape для выхода
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        logout();
    }
}); 