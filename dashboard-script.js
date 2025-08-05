// Данные чатов
const chats = [
    { id: 1, name: 'Иван Петров', type: 'private', lastMessage: 'Привет!', unread: 2, selected: false },
    { id: 2, name: 'Мария Сидорова', type: 'private', lastMessage: 'Спасибо за информацию', unread: 0, selected: false },
    { id: 3, name: 'Алексей Козлов', type: 'private', lastMessage: 'Интересно узнать больше', unread: 1, selected: false },
    { id: 4, name: 'Елена Воробьева', type: 'private', lastMessage: 'Готов к сотрудничеству', unread: 0, selected: false },
    { id: 5, name: 'Дмитрий Смирнов', type: 'private', lastMessage: 'Когда будет новая продукция?', unread: 3, selected: false },
    { id: 6, name: 'Анна Козлова', type: 'private', lastMessage: 'Получил ваш каталог', unread: 0, selected: false }
];

// Данные групп
const groups = [
    { id: 1, name: 'Продажи', members: 15, type: 'group', description: 'Группа отдела продаж', selected: false },
    { id: 2, name: 'Маркетинг', members: 8, type: 'group', description: 'Маркетинговая команда', selected: false },
    { id: 3, name: 'VIP клиенты', members: 25, type: 'group', description: 'Премиум клиенты', selected: false },
    { id: 4, name: 'Новые клиенты', members: 42, type: 'group', description: 'Недавно зарегистрированные', selected: false }
];

// Данные сессий
const sessions = [
    { id: 1, user: 'Иван Петров', device: 'Chrome', ip: '192.168.1.100', lastActivity: '2 минуты назад', status: 'active' },
    { id: 2, user: 'Мария Сидорова', device: 'Safari', ip: '192.168.1.101', lastActivity: '5 минут назад', status: 'active' },
    { id: 3, user: 'Алексей Козлов', device: 'Firefox', ip: '192.168.1.102', lastActivity: '15 минут назад', status: 'idle' },
    { id: 4, user: 'Елена Воробьева', device: 'Chrome', ip: '192.168.1.103', lastActivity: '1 час назад', status: 'active' },
    { id: 5, user: 'Дмитрий Смирнов', device: 'Edge', ip: '192.168.1.104', lastActivity: '30 минут назад', status: 'active' }
];

// Функция переключения вкладок
function showTab(tabName) {
    // Скрываем все вкладки
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Убираем активный класс у всех кнопок
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Показываем нужную вкладку
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Добавляем активный класс к нужной кнопке
    event.target.classList.add('active');
    
    // Загружаем данные для вкладки
    if (tabName === 'chats') {
        loadChats();
    } else if (tabName === 'sessions') {
        loadSessions();
    }
}

// Загрузка чатов
function loadChats() {
    const chatsGrid = document.getElementById('chatsGrid');
    chatsGrid.innerHTML = '';
    
    // Добавляем чаты
    chats.forEach(chat => {
        const chatCard = createChatCard(chat);
        chatsGrid.appendChild(chatCard);
    });
    
    // Добавляем группы
    groups.forEach(group => {
        const groupCard = createGroupCard(group);
        chatsGrid.appendChild(groupCard);
    });
    
    // Обновляем счетчик
    updateSelectedCount();
}

// Создание карточки чата
function createChatCard(chat) {
    const card = document.createElement('div');
    card.className = `chat-card ${chat.selected ? 'selected' : ''}`;
    card.onclick = () => toggleChatSelection(chat.id);
    
    card.innerHTML = `
        <div class="chat-info">
            <div class="chat-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="chat-details">
                <h3>${chat.name}</h3>
                <p>${chat.lastMessage}</p>
            </div>
        </div>
        <div class="chat-meta">
            ${chat.unread > 0 ? `<span class="unread-count">${chat.unread}</span>` : ''}
            <input type="checkbox" ${chat.selected ? 'checked' : ''} onclick="event.stopPropagation(); toggleChatSelection(${chat.id})">
        </div>
    `;
    
    return card;
}

// Создание карточки группы
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = `group-card ${group.selected ? 'selected' : ''}`;
    card.onclick = () => toggleGroupSelection(group.id);
    
    card.innerHTML = `
        <div class="group-info">
            <div class="group-avatar">
                <i class="fas fa-users"></i>
            </div>
            <div class="group-details">
                <h3>${group.name}</h3>
                <p>${group.description}</p>
                <span class="member-count">${group.members} участников</span>
            </div>
        </div>
        <div class="group-meta">
            <input type="checkbox" ${group.selected ? 'checked' : ''} onclick="event.stopPropagation(); toggleGroupSelection(${group.id})">
        </div>
    `;
    
    return card;
}

// Переключение выбора чата
function toggleChatSelection(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
        chat.selected = !chat.selected;
        updateSelectedCount();
        loadChats(); // Перезагружаем для обновления UI
    }
}

// Переключение выбора группы
function toggleGroupSelection(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.selected = !group.selected;
        updateSelectedCount();
        loadChats(); // Перезагружаем для обновления UI
    }
}

// Обновление счетчика выбранных элементов
function updateSelectedCount() {
    const selectedChats = chats.filter(c => c.selected);
    const selectedGroups = groups.filter(g => g.selected);
    const total = selectedChats.length + selectedGroups.length;
    
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = `(${total} выбрано)`;
    }
}

// Фильтрация чатов
function filterChats() {
    const searchTerm = document.getElementById('chatSearch').value.toLowerCase();
    const chatCards = document.querySelectorAll('.chat-card, .group-card');
    
    chatCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Загрузка сессий
function loadSessions() {
    const sessionsGrid = document.getElementById('sessionsGrid');
    sessionsGrid.innerHTML = '';
    
    sessions.forEach(session => {
        const sessionCard = createSessionCard(session);
        sessionsGrid.appendChild(sessionCard);
    });
}

// Создание карточки сессии
function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = `session-card ${session.status}`;
    
    card.innerHTML = `
        <div class="session-info">
            <div class="session-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="session-details">
                <h3>${session.user}</h3>
                <p><i class="fas fa-desktop"></i> ${session.device}</p>
                <p><i class="fas fa-network-wired"></i> ${session.ip}</p>
            </div>
        </div>
        <div class="session-meta">
            <span class="last-activity">${session.lastActivity}</span>
            <span class="status-badge ${session.status}">${getStatusText(session.status)}</span>
        </div>
    `;
    
    return card;
}

// Получение текста статуса
function getStatusText(status) {
    switch(status) {
        case 'active': return 'Активна';
        case 'idle': return 'Неактивна';
        default: return 'Неизвестно';
    }
}



// Показ уведомлений
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadChats();
    
    // Устанавливаем имя пользователя
    const userName = localStorage.getItem('userName') || 'Администратор';
    document.getElementById('userName').textContent = userName;
}); 