// Глобальные переменные
let users = [];
let currentEditingUserId = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию и права администратора
    checkAdminAccess();
    
    // Загружаем пользователей
    loadUsers();
    
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

// Загрузка пользователей
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        
        users = data.users;
        renderUsersTable();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Ошибка загрузки пользователей', 'error');
    }
}

// Обновление таблицы пользователей
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Нет пользователей</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr data-user-id="${user.id}">
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.fullName || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td>
                <span class="role-badge ${user.role}">
                    ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editUserRole(${user.id}, '${user.username}', '${user.role}')" 
                            class="btn-edit" title="Изменить роль">
                        <i class="fas fa-user-edit"></i>
                    </button>
                    ${user.username !== 'admin' ? `
                        <button onclick="deleteUser(${user.id}, '${user.username}')" 
                                class="btn-delete" title="Удалить пользователя">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Фильтрация пользователей
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const username = row.cells[1].textContent.toLowerCase();
        const fullName = row.cells[2].textContent.toLowerCase();
        const phone = row.cells[3].textContent.toLowerCase();
        
        if (username.includes(searchTerm) || fullName.includes(searchTerm) || phone.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Обновление пользователей
function refreshUsers() {
    loadUsers();
    showNotification('Список пользователей обновлен', 'success');
}

// Редактирование роли пользователя
function editUserRole(userId, username, currentRole) {
    currentEditingUserId = userId;
    document.getElementById('modalUserName').textContent = username;
    document.getElementById('roleSelect').value = currentRole;
    document.getElementById('roleModal').style.display = 'block';
}

// Закрытие модального окна
function closeRoleModal() {
    document.getElementById('roleModal').style.display = 'none';
    currentEditingUserId = null;
}

// Сохранение роли пользователя
async function saveUserRole() {
    if (!currentEditingUserId) return;
    
    const newRole = document.getElementById('roleSelect').value;
    
    try {
        const response = await fetch(`/api/admin/users/${currentEditingUserId}/role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Роль пользователя успешно изменена', 'success');
            closeRoleModal();
            loadUsers(); // Перезагружаем таблицу
        } else {
            showNotification(data.error || 'Ошибка изменения роли', 'error');
        }
        
    } catch (error) {
        console.error('Error updating user role:', error);
        showNotification('Ошибка изменения роли пользователя', 'error');
    }
}

// Удаление пользователя
async function deleteUser(userId, username) {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Пользователь успешно удален', 'success');
            loadUsers(); // Перезагружаем таблицу
        } else {
            showNotification(data.error || 'Ошибка удаления пользователя', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Ошибка удаления пользователя', 'error');
    }
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Обновление имени пользователя в навигации
function updateUserNameNav() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = `${user.fullName} (${user.role === 'admin' ? 'Администратор' : 'Пользователь'})`;
        }
    }
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('roleModal');
    if (event.target === modal) {
        closeRoleModal();
    }
} 