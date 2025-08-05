const mysql = require('mysql2/promise');

// Конфигурация подключения к MySQL
const dbConfig = {
    host: '79.174.89.149',
    port: 15657,
    user: 'user1',
    password: 'dasdfaASDWQ1$',
    database: 'auth_website',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Создаем пул соединений
let pool = null;

// Инициализация подключения к базе данных
async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Проверяем подключение
        const connection = await pool.getConnection();
        console.log('✅ MySQL подключение установлено успешно');
        
        // Создаем таблицы если их нет
        await createTables(connection);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к MySQL:', error.message);
        return false;
    }
}

// Создание таблиц
async function createTables(connection) {
    try {
        // Таблица пользователей
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                fullName VARCHAR(100),
                email VARCHAR(100),
                role ENUM('user', 'admin') DEFAULT 'user',
                points INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Таблица продуктов
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                points INT DEFAULT 0,
                image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Таблица статей
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS articles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                author VARCHAR(100),
                image VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Таблица чатов
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS chats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                contact_name VARCHAR(100),
                contact_number VARCHAR(20),
                last_message TEXT,
                last_message_time TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Таблица сообщений
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                chat_id INT,
                message_text TEXT,
                is_from_me BOOLEAN DEFAULT FALSE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Таблицы созданы успешно');
    } catch (error) {
        console.error('❌ Ошибка создания таблиц:', error.message);
    }
}

// Функции для работы с пользователями
async function createUser(userData) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, fullName, email, role) VALUES (?, ?, ?, ?, ?)',
            [userData.username, userData.password, userData.fullName, userData.email, userData.role || 'user']
        );
        return { success: true, userId: result.insertId };
    } catch (error) {
        console.error('Ошибка создания пользователя:', error);
        return { success: false, error: error.message };
    }
}

async function findUserByUsername(username) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Ошибка поиска пользователя:', error);
        return null;
    }
}

async function findUserById(id) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Ошибка поиска пользователя по ID:', error);
        return null;
    }
}

async function updateUserPoints(userId, points) {
    try {
        await pool.execute(
            'UPDATE users SET points = points + ? WHERE id = ?',
            [points, userId]
        );
        return { success: true };
    } catch (error) {
        console.error('Ошибка обновления баллов:', error);
        return { success: false, error: error.message };
    }
}

// Функции для работы с продуктами
async function getAllProducts() {
    try {
        const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
        return { success: true, products: rows };
    } catch (error) {
        console.error('Ошибка получения продуктов:', error);
        return { success: false, error: error.message };
    }
}

async function createProduct(productData) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO products (name, description, price, points, image) VALUES (?, ?, ?, ?, ?)',
            [productData.name, productData.description, productData.price, productData.points, productData.image]
        );
        return { success: true, productId: result.insertId };
    } catch (error) {
        console.error('Ошибка создания продукта:', error);
        return { success: false, error: error.message };
    }
}

async function updateProduct(id, productData) {
    try {
        await pool.execute(
            'UPDATE products SET name = ?, description = ?, price = ?, points = ?, image = ? WHERE id = ?',
            [productData.name, productData.description, productData.price, productData.points, productData.image, id]
        );
        return { success: true };
    } catch (error) {
        console.error('Ошибка обновления продукта:', error);
        return { success: false, error: error.message };
    }
}

async function deleteProduct(id) {
    try {
        await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Ошибка удаления продукта:', error);
        return { success: false, error: error.message };
    }
}

// Функции для работы со статьями
async function getAllArticles() {
    try {
        const [rows] = await pool.execute('SELECT * FROM articles ORDER BY created_at DESC');
        return { success: true, articles: rows };
    } catch (error) {
        console.error('Ошибка получения статей:', error);
        return { success: false, error: error.message };
    }
}

async function createArticle(articleData) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO articles (title, content, author, image) VALUES (?, ?, ?, ?)',
            [articleData.title, articleData.content, articleData.author, articleData.image]
        );
        return { success: true, articleId: result.insertId };
    } catch (error) {
        console.error('Ошибка создания статьи:', error);
        return { success: false, error: error.message };
    }
}

async function updateArticle(id, articleData) {
    try {
        await pool.execute(
            'UPDATE articles SET title = ?, content = ?, author = ?, image = ? WHERE id = ?',
            [articleData.title, articleData.content, articleData.author, articleData.image, id]
        );
        return { success: true };
    } catch (error) {
        console.error('Ошибка обновления статьи:', error);
        return { success: false, error: error.message };
    }
}

async function deleteArticle(id) {
    try {
        await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Ошибка удаления статьи:', error);
        return { success: false, error: error.message };
    }
}

// Функции для работы с чатами
async function getUserChats(userId) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM chats WHERE user_id = ? ORDER BY last_message_time DESC',
            [userId]
        );
        return { success: true, chats: rows };
    } catch (error) {
        console.error('Ошибка получения чатов:', error);
        return { success: false, error: error.message };
    }
}

async function createChat(chatData) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO chats (user_id, contact_name, contact_number, last_message, last_message_time) VALUES (?, ?, ?, ?, ?)',
            [chatData.userId, chatData.contactName, chatData.contactNumber, chatData.lastMessage, new Date()]
        );
        return { success: true, chatId: result.insertId };
    } catch (error) {
        console.error('Ошибка создания чата:', error);
        return { success: false, error: error.message };
    }
}

async function updateChatLastMessage(chatId, message) {
    try {
        await pool.execute(
            'UPDATE chats SET last_message = ?, last_message_time = ? WHERE id = ?',
            [message, new Date(), chatId]
        );
        return { success: true };
    } catch (error) {
        console.error('Ошибка обновления последнего сообщения:', error);
        return { success: false, error: error.message };
    }
}

// Функции для работы с сообщениями
async function getChatMessages(chatId) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
            [chatId]
        );
        return { success: true, messages: rows };
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        return { success: false, error: error.message };
    }
}

async function createMessage(messageData) {
    try {
        const [result] = await pool.execute(
            'INSERT INTO messages (chat_id, message_text, is_from_me) VALUES (?, ?, ?)',
            [messageData.chatId, messageData.messageText, messageData.isFromMe]
        );
        return { success: true, messageId: result.insertId };
    } catch (error) {
        console.error('Ошибка создания сообщения:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    initializeDatabase,
    createUser,
    findUserByUsername,
    findUserById,
    updateUserPoints,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    getUserChats,
    createChat,
    updateChatLastMessage,
    getChatMessages,
    createMessage
}; 