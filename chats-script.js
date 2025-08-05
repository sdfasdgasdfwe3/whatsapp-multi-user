// Данные чатов
let chats = [
    { id: 1, name: 'Иван Петров', type: 'private', lastMessage: 'Привет!', unread: 2, selected: false },
    { id: 2, name: 'Мария Сидорова', type: 'private', lastMessage: 'Спасибо за информацию', unread: 0, selected: false },
    { id: 3, name: 'Алексей Козлов', type: 'private', lastMessage: 'Интересно узнать больше', unread: 1, selected: false },
    { id: 4, name: 'Елена Воробьева', type: 'private', lastMessage: 'Готов к сотрудничеству', unread: 0, selected: false },
    { id: 5, name: 'Дмитрий Смирнов', type: 'private', lastMessage: 'Когда будет новая продукция?', unread: 3, selected: false },
    { id: 6, name: 'Анна Козлова', type: 'private', lastMessage: 'Получил ваш каталог', unread: 0, selected: false }
];

// Данные групп
let groups = [
    { id: 1, name: 'Продажи', members: 15, type: 'group', description: 'Группа отдела продаж', selected: false },
    { id: 2, name: 'Маркетинг', members: 8, type: 'group', description: 'Маркетинговая команда', selected: false },
    { id: 3, name: 'VIP клиенты', members: 25, type: 'group', description: 'Премиум клиенты', selected: false },
    { id: 4, name: 'Новые клиенты', members: 42, type: 'group', description: 'Недавно зарегистрированные', selected: false }
];

// Статус подключения WhatsApp (по умолчанию не подключен)
let whatsappConnected = false;

// Проверка статуса WhatsApp при загрузке страницы
async function checkWhatsAppStatus() {
    try {
        // Получаем текущего пользователя
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            console.error('User not authenticated');
            return;
        }
        
        const response = await fetch(`http://localhost:3001/api/whatsapp/status/${currentUser.id}`);
        const data = await response.json();
        
        whatsappConnected = data.connected;
    
        // Показываем блоки чатов только на главной странице
        if (window.location.pathname.includes('home.html') || window.location.pathname === '/') {
            if (whatsappConnected) {
                localStorage.setItem('whatsappConnected', 'true');
                showChatsListInline();
            } else {
                localStorage.removeItem('whatsappConnected');
                showWhatsAppConnectInline();
            }
        }
    } catch (error) {
        console.error('Error checking WhatsApp status:', error);
        // Если сервер недоступен, показываем блок подключения только на главной странице
        if (window.location.pathname.includes('home.html') || window.location.pathname === '/') {
            showWhatsAppConnectInline();
        }
    }
}



// Показать блок подключения WhatsApp
function showWhatsAppConnectInline() {
    document.getElementById('whatsapp-connect-inline').style.display = 'block';
    document.getElementById('chats-list-inline').style.display = 'none';
    
    // Генерируем QR-код
    generateQRCodeInline();
}

// Показать список чатов
function showChatsListInline() {
    document.getElementById('whatsapp-connect-inline').style.display = 'none';
    document.getElementById('chats-list-inline').style.display = 'block';
    
    // Загружаем чаты
    loadChatsInline();
}

// Генерация QR-кода для реального WhatsApp
async function generateQRCodeInline() {
    const qrContainer = document.getElementById('qrCodeInline');
    
    // Очищаем контейнер
    qrContainer.innerHTML = '';
    
    try {
        // Получаем текущего пользователя
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            qrContainer.innerHTML = '<p style="color: #ff6b6b; text-align: center;">Пользователь не авторизован</p>';
            return;
        }
        
        // Получаем QR-код с сервера для конкретного пользователя
        const response = await fetch(`http://localhost:3001/api/whatsapp/qr/${currentUser.id}`);
        const data = await response.json();
        
        if (data.connected) {
            // Если уже подключен, показываем список чатов
            showChatsListInline();
            return;
        }
        
        if (data.qrCode) {
            // Очищаем контейнер перед добавлением нового QR-кода
            qrContainer.innerHTML = '';
            
            // Создаем QR-код как изображение
    const qrCode = document.createElement('div');
    qrCode.className = 'qr-code-placeholder-inline';
            
            const qrImage = document.createElement('img');
            qrImage.src = data.qrCode;
            qrImage.style.width = '200px';
            qrImage.style.height = '200px';
            qrImage.style.borderRadius = '8px';
            qrImage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            
            qrCode.appendChild(qrImage);
    qrContainer.appendChild(qrCode);
    
            // Показываем уведомление
            showNotification('QR-код получен! Отсканируйте его в WhatsApp', 'info');
            
            // Проверяем статус подключения каждые 2 секунды
            const checkInterval = setInterval(async () => {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (!currentUser || !currentUser.id) {
                    clearInterval(checkInterval);
                    return;
                }
                
                const statusResponse = await fetch(`http://localhost:3001/api/whatsapp/status/${currentUser.id}`);
                const statusData = await statusResponse.json();
                
                if (statusData.connected) {
                    clearInterval(checkInterval);
                    simulateWhatsAppConnection();
                }
            }, 2000);
            
        } else {
            // Показываем ошибку
            qrContainer.innerHTML = '<p style="color: #ff6b6b; text-align: center;">Ошибка получения QR-кода</p>';
        }
        
    } catch (error) {
        console.error('Error getting QR code:', error);
        qrContainer.innerHTML = '<p style="color: #ff6b6b; text-align: center;">Ошибка подключения к серверу</p>';
    }
}

// Имитация подключения WhatsApp
function simulateWhatsAppConnection() {
    whatsappConnected = true;
    localStorage.setItem('whatsappConnected', 'true');
    
    // Показываем уведомление
    showNotification('WhatsApp успешно подключен!', 'success');
    
    // Переключаемся на список чатов
    showChatsListInline();
    
    // Обновляем статус на главной странице
    updateMainPageStatus();
}

// Отключение WhatsApp
async function disconnectWhatsApp() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            showNotification('Пользователь не авторизован', 'error');
            return;
        }
        
        const response = await fetch(`http://localhost:3001/api/whatsapp/disconnect/${currentUser.id}`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            whatsappConnected = false;
            localStorage.removeItem('whatsappConnected');
            
            // Показываем уведомление
            showNotification('WhatsApp отключен', 'info');
            
            // Переключаемся на блок подключения
            showWhatsAppConnectInline();
            
            // Обновляем статус на главной странице
            updateMainPageStatus();
        } else {
            showNotification('Ошибка отключения WhatsApp', 'error');
        }
    } catch (error) {
        console.error('Error disconnecting WhatsApp:', error);
        showNotification('Ошибка отключения WhatsApp', 'error');
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

// Переменная для отслеживания состояния загрузки
let isLoadingChats = false;

// Загрузка чатов для inline версии
async function loadChatsInline() {
    const chatsGrid = document.getElementById('chatsGridInline');
    if (!chatsGrid) {
        console.error('Chats grid not found');
        return;
    }
    
    // Защита от повторного вызова
    if (isLoadingChats) {
        console.log('Chats loading already in progress, skipping...');
        return;
    }
    
    isLoadingChats = true;
    chatsGrid.innerHTML = '';
    
    try {
        // Получаем текущего пользователя
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            chatsGrid.innerHTML = '<div class="empty-state error"><i class="fas fa-exclamation-triangle"></i><p>Пользователь не авторизован</p></div>';
            return;
        }
        
        console.log('Loading chats from server for user:', currentUser.id);
        // Получаем реальные чаты с сервера для конкретного пользователя
        const response = await fetch(`http://localhost:3001/api/whatsapp/chats/${currentUser.id}`);
        const data = await response.json();
        
        console.log('Server response:', data);
        
        if ((data.privateChats && data.privateChats.length > 0) || (data.groupChats && data.groupChats.length > 0)) {
            // Очищаем старые данные
            chats.length = 0;
            groups.length = 0;
            
            console.log('Private chats:', data.privateChats?.length || 0);
            console.log('Group chats:', data.groupChats?.length || 0);
            
            // Получаем сохраненные выбранные чаты из localStorage
            const savedSelectedChats = localStorage.getItem('selectedChats');
            let selectedChatIds = [];
            if (savedSelectedChats) {
                try {
                    selectedChatIds = JSON.parse(savedSelectedChats);
                } catch (error) {
                    console.warn('Error parsing saved chats:', error);
                }
            }
            
            // Добавляем приватные чаты
            if (data.privateChats) {
                data.privateChats.forEach(chat => {
                    // Убираем @c.us из ID для отображения
                    const cleanId = chat.id.replace('@c.us', '');
                    
                    chats.push({
                        id: chat.id,
                        name: chat.name || cleanId,
                        type: 'private',
                        selected: selectedChatIds.includes(chat.id)
                    });
                });
            }
            
            // Добавляем группы
            if (data.groupChats) {
                data.groupChats.forEach(group => {
                    groups.push({
                        id: group.id,
                        name: group.name || 'Группа',
                        members: 0,
                        type: 'group',
                        selected: selectedChatIds.includes(group.id)
                    });
                });
            }
            
            console.log('Processed chats:', chats.length);
            console.log('Processed groups:', groups.length);
            
            // Очищаем контейнер перед добавлением
            chatsGrid.innerHTML = '';
            
            // Отображаем чаты
            chats.forEach(chat => {
                const chatCard = createChatCardInline(chat);
                chatsGrid.appendChild(chatCard);
            });
            
            // Отображаем группы
            groups.forEach(group => {
                const groupCard = createGroupCardInline(group);
                chatsGrid.appendChild(groupCard);
            });
            
            // Обновляем счетчик
            updateSelectedCountInline();
            
        } else {
            chatsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>Нет доступных чатов</p></div>';
        }
        
    } catch (error) {
        console.error('Error loading chats:', error);
        chatsGrid.innerHTML = '<div class="empty-state error"><i class="fas fa-exclamation-triangle"></i><p>Ошибка загрузки чатов</p></div>';
    } finally {
        isLoadingChats = false;
    }
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

// Создание карточки чата для inline версии
function createChatCardInline(chat) {
    const card = document.createElement('div');
    card.className = `chat-card-inline ${chat.selected ? 'selected' : ''}`;
    card.setAttribute('data-chat-id', chat.id);
    card.onclick = () => toggleChatSelectionInline(chat.id);
    
    card.innerHTML = `
        <div class="chat-info-inline">
            <div class="chat-avatar-inline">
                <i class="fas fa-user"></i>
            </div>
            <div class="chat-details-inline">
                <h4>${chat.name}</h4>
            </div>
        </div>
        <div class="chat-meta-inline">
            <input type="checkbox" ${chat.selected ? 'checked' : ''} onclick="event.stopPropagation(); toggleChatSelectionInline('${chat.id}')">
        </div>
    `;
    
    return card;
}

// Создание карточки группы для inline версии
function createGroupCardInline(group) {
    const card = document.createElement('div');
    card.className = `group-card-inline ${group.selected ? 'selected' : ''}`;
    card.setAttribute('data-chat-id', group.id);
    card.onclick = () => toggleGroupSelectionInline(group.id);
    
    card.innerHTML = `
        <div class="group-info-inline">
            <div class="group-avatar-inline">
                <i class="fas fa-users"></i>
            </div>
            <div class="group-details-inline">
                <h4>${group.name}</h4>
                <span class="member-count-inline">${group.members} участников</span>
            </div>
        </div>
        <div class="group-meta-inline">
            <input type="checkbox" ${group.selected ? 'checked' : ''} onclick="event.stopPropagation(); toggleGroupSelectionInline('${group.id}')">
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
        loadChats();
    }
}

// Переключение выбора группы
function toggleGroupSelection(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.selected = !group.selected;
        updateSelectedCount();
        loadChats();
    }
}

// Переключение выбора чата для inline версии
function toggleChatSelectionInline(chatId) {
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
        chat.selected = !chat.selected;
        updateSelectedCountInline();
        
        // Обновляем только выбранную карточку без перезагрузки всех чатов
        const chatCards = document.querySelectorAll('.chat-card-inline');
        chatCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.onclick.toString().includes(chatId)) {
                card.classList.toggle('selected', chat.selected);
                checkbox.checked = chat.selected;
            }
        });
    }
}

// Переключение выбора группы для inline версии
function toggleGroupSelectionInline(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (group) {
        group.selected = !group.selected;
        updateSelectedCountInline();
        
        // Обновляем только выбранную карточку без перезагрузки всех чатов
        const groupCards = document.querySelectorAll('.group-card-inline');
        groupCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.onclick.toString().includes(groupId)) {
                card.classList.toggle('selected', group.selected);
                checkbox.checked = group.selected;
            }
        });
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

// Обновление счетчика выбранных элементов для inline версии
function updateSelectedCountInline() {
    const selectedChats = chats.filter(c => c.selected);
    const selectedGroups = groups.filter(g => g.selected);
    const total = selectedChats.length + selectedGroups.length;
    
    const countElement = document.getElementById('selectedCountInline');
    if (countElement) {
        countElement.textContent = `(${total} выбрано)`;
    }
    
    // Сохраняем выбранные чаты в localStorage для использования на других страницах
    const selectedChatIds = [];
    selectedChats.forEach(chat => selectedChatIds.push(chat.id));
    selectedGroups.forEach(group => selectedChatIds.push(group.id));
    localStorage.setItem('selectedChats', JSON.stringify(selectedChatIds));
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

// Фильтрация чатов для inline версии
function filterChatsInline() {
    const searchTerm = document.getElementById('chatSearchInline').value.toLowerCase();
    const chatCards = document.querySelectorAll('.chat-card-inline, .group-card-inline');
    
    chatCards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Отправка сообщений выбранным
function sendToSelected(type) {
    const selectedChats = chats.filter(c => c.selected);
    const selectedGroups = groups.filter(g => g.selected);
    
    if (selectedChats.length === 0 && selectedGroups.length === 0) {
        showNotification('Выберите хотя бы один чат или группу для отправки', 'error');
        return;
    }
    
    let message = '';
    switch(type) {
        case 'product':
            message = 'Информация о продукции отправлена';
            break;
        case 'article':
            message = 'Статьи отправлены';
            break;
        case 'promotion':
            message = 'Акции отправлены';
            break;
    }
    
    const total = selectedChats.length + selectedGroups.length;
    showNotification(`${message} в ${total} ${total === 1 ? 'чат' : total < 5 ? 'чата' : 'чатов'}`, 'success');
    
    // Очищаем выбор
    chats.forEach(c => c.selected = false);
    groups.forEach(g => g.selected = false);
    loadChats();
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
    // Проверяем статус WhatsApp при загрузке
    checkWhatsAppStatus();
    
    // Обновляем статус на главной странице
    updateMainPageStatus();
    
    // Показываем QR-код по умолчанию только на главной странице
    if (window.location.pathname.includes('home.html') || window.location.pathname === '/') {
        generateQRCodeInline();
    }
});

// Обновление статуса на главной странице
async function updateMainPageStatus() {
    const statusElement = document.getElementById('whatsappStatus');
    if (statusElement) {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.id) {
                statusElement.innerHTML = '<span class="status-disconnected">Не авторизован</span>';
                return;
            }
            
            const response = await fetch(`http://localhost:3001/api/whatsapp/status/${currentUser.id}`);
            const data = await response.json();
            
            if (data.connected) {
                statusElement.innerHTML = '<span class="status-connected">Подключен</span>';
            } else {
                statusElement.innerHTML = '<span class="status-disconnected">Не подключен</span>';
            }
        } catch (error) {
            console.error('Error updating status:', error);
            statusElement.innerHTML = '<span class="status-disconnected">Не подключен</span>';
        }
    }
} 

 