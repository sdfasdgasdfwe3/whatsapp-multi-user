// Динамическая загрузка статей из базы данных
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    checkAuth();
    
    // Загружаем статьи
    loadArticles();
    
    // Показываем контролы администратора если пользователь админ
    showAdminControls();
});

// Проверка авторизации
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(savedUser);
    document.getElementById('userName').textContent = user.fullName || user.username;
}

// Показываем контролы администратора
function showAdminControls() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
            const adminControls = document.getElementById('adminControls');
            if (adminControls) {
                adminControls.style.display = 'block';
            }
        }
    }
}

// Загрузка статей из базы данных
async function loadArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    
    try {
        const response = await fetch('http://89.104.66.62:3001/api/articles');
        const data = await response.json();
        
        if (data.success) {
            renderArticles(data.articles);
        } else {
            showError('Ошибка загрузки статей');
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        showError('Ошибка подключения к серверу');
    }
}

// Отрисовка статей
function renderArticles(articles) {
    const articlesGrid = document.getElementById('articlesGrid');
    
    if (!articles || articles.length === 0) {
        articlesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <p>Нет доступных статей</p>
            </div>
        `;
        return;
    }
    
    const articlesHTML = articles.map(article => `
        <div class="article-card">
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}" onerror="this.src='https://via.placeholder.com/200x200/667eea/ffffff?text=Нет+изображения'">
            </div>
            <div class="article-info">
                <h3>${article.title}</h3>
                <p class="article-excerpt">${article.content.substring(0, 100)}${article.content.length > 100 ? '...' : ''}</p>
                <div class="article-meta">
                    <span class="author">Автор: ${article.author || 'Неизвестно'}</span>
                    <span class="date">${new Date(article.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
            <div class="article-actions" id="articleActions" style="display: none;">
                <button class="btn-edit" onclick="editArticle(${article.id})" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteArticle(${article.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="whatsapp-share">
                <button class="btn-whatsapp" onclick="shareToWhatsApp('${article.title}', '${new Date(article.created_at).toLocaleDateString('ru-RU')}', '${article.content.substring(0, 100)}...')">
                    <i class="fab fa-whatsapp"></i>
                    Отправить в WhatsApp
                </button>
            </div>
        </div>
    `).join('');
    
    articlesGrid.innerHTML = articlesHTML;
    
    // Показываем кнопки редактирования для администраторов
    showArticleActions();
}

// Показываем кнопки действий для статей (только для администраторов)
function showArticleActions() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
            const articleActions = document.querySelectorAll('.article-actions');
            articleActions.forEach(action => {
                action.style.display = 'flex';
            });
        }
    }
}

// Показать ошибку
function showError(message) {
    const articlesGrid = document.getElementById('articlesGrid');
    articlesGrid.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="loadArticles()" class="btn-retry">
                <i class="fas fa-refresh"></i>
                Попробовать снова
            </button>
        </div>
    `;
}

// Обновить список статей
function refreshArticles() {
    loadArticles();
    showNotification('Список статей обновлен', 'success');
} 