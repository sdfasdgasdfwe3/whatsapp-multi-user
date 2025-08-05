// Глобальные переменные
let products = [];
let currentEditingProductId = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию и права администратора
    checkAdminAccess();
    
    // Загружаем продукты
    loadProducts();
    
    // Обновляем имя пользователя в навигации
    updateUserNameNav();
});

// Проверка доступа администратора
function checkAdminAccess() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(savedUser);
    if (user.role !== 'admin') {
        showNotification('Доступ запрещен. Требуются права администратора.', 'error');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    }
}

// Загрузка продуктов
async function loadProducts() {
    try {
        const response = await fetch('http://89.104.66.62:3001/api/products');
        const data = await response.json();
        
        if (data.success) {
            products = data.products;
            renderProductsGrid();
        } else {
            showNotification('Ошибка загрузки продуктов', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Ошибка загрузки продуктов', 'error');
    }
}

// Обновление сетки продуктов
function renderProductsGrid() {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>Нет продуктов</p></div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card admin-product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Нет+изображения'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">${product.price}</p>
                <p class="product-category">${product.category}</p>
                <p class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
            </div>
            <div class="product-actions">
                <button onclick="editProduct(${product.id})" class="btn-edit" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct(${product.id})" class="btn-delete" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Фильтрация продуктов
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const productCards = document.querySelectorAll('.admin-product-card');
    
    productCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        const category = card.querySelector('.product-category').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Обновление продуктов
function refreshProducts() {
    loadProducts();
    showNotification('Список продуктов обновлен', 'success');
}

// Показать модальное окно добавления продукта
function showAddProductModal() {
    currentEditingProductId = null;
    document.getElementById('modalTitle').textContent = 'Добавить продукт';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').style.display = 'block';
}

// Закрыть модальное окно
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    currentEditingProductId = null;
}

// Редактирование продукта
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentEditingProductId = productId;
    document.getElementById('modalTitle').textContent = 'Редактировать продукт';
    
    // Заполняем форму данными продукта
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    
    document.getElementById('productModal').style.display = 'block';
}

// Сохранение продукта
async function saveProduct(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };
    
    try {
        let response;
        if (currentEditingProductId) {
            // Обновление существующего продукта
            response = await fetch(`http://89.104.66.62:3001/api/products/${currentEditingProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Создание нового продукта
            response = await fetch('http://89.104.66.62:3001/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(
                currentEditingProductId ? 'Продукт успешно обновлен' : 'Продукт успешно добавлен', 
                'success'
            );
            closeProductModal();
            loadProducts(); // Перезагружаем список
        } else {
            showNotification(data.error || 'Ошибка сохранения продукта', 'error');
        }
        
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Ошибка сохранения продукта', 'error');
    }
}

// Удаление продукта
async function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (!confirm(`Вы уверены, что хотите удалить продукт "${product.name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`http://89.104.66.62:3001/api/products/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Продукт успешно удален', 'success');
            loadProducts(); // Перезагружаем список
        } else {
            showNotification(data.error || 'Ошибка удаления продукта', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Ошибка удаления продукта', 'error');
    }
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeProductModal();
    }
} 