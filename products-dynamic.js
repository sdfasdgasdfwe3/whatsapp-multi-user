// Динамическая загрузка продуктов из базы данных
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    checkAuth();
    
    // Загружаем продукты
    loadProducts();
    
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

// Загрузка продуктов из базы данных
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    try {
        const response = await fetch('http://89.104.66.62:3003/api/products');
        const data = await response.json();
        
        if (data.success) {
            renderProducts(data.products);
        } else {
            showError('Ошибка загрузки продуктов');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Ошибка подключения к серверу');
    }
}

// Отрисовка продуктов
function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>Нет доступных продуктов</p>
            </div>
        `;
        return;
    }
    
    const productsHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x200/667eea/ffffff?text=Нет+изображения'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="price">${product.price}</span>
                    <span class="points">${product.points || '0'} баллов</span>
                </div>
            </div>
            <div class="product-actions" id="productActions" style="display: none;">
                <button class="btn-edit" onclick="editProduct(${product.id})" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="whatsapp-share">
                <button class="btn-whatsapp" onclick="shareToWhatsApp('${product.name}', '${product.price}', '${product.description}')">
                    <i class="fab fa-whatsapp"></i>
                    Отправить в WhatsApp
                </button>
            </div>
        </div>
    `).join('');
    
    productsGrid.innerHTML = productsHTML;
    
    // Показываем кнопки редактирования для администраторов
    showProductActions();
}

// Показываем кнопки действий для продуктов (только для администраторов)
function showProductActions() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
            const productActions = document.querySelectorAll('.product-actions');
            productActions.forEach(action => {
                action.style.display = 'flex';
            });
        }
    }
}

// Показать ошибку
function showError(message) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="loadProducts()" class="btn-retry">
                <i class="fas fa-refresh"></i>
                Попробовать снова
            </button>
        </div>
    `;
}

// Обновить список продуктов
function refreshProducts() {
    loadProducts();
    showNotification('Список продуктов обновлен', 'success');
} 