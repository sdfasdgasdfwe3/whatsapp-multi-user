#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const port = 3001;

// Настройка CORS
app.use(cors({
    origin: ['http://89.104.66.62', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.static('.'));

// Обработчик для preflight запросов
app.options('*', cors());

// Тестовый эндпоинт
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Сервер работает!',
        timestamp: new Date().toISOString()
    });
});

// Проверка статуса базы данных
app.get('/api/db-status', async (req, res) => {
    try {
        const result = await db.getAllProducts();
        res.json({ 
            success: true, 
            dbConnected: result.success,
            productsCount: result.success ? result.products.length : 0
        });
    } catch (error) {
        res.json({ 
            success: false, 
            dbConnected: false,
            error: error.message 
        });
    }
});

// API для продуктов
app.get('/api/products', async (req, res) => {
    try {
        const result = await db.getAllProducts();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка получения продуктов:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// API для статей
app.get('/api/articles', async (req, res) => {
    try {
        const result = await db.getAllArticles();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка получения статей:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Аутентификация
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Ищем пользователя
        const user = await db.findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Неверное имя пользователя или пароль' });
        }
        
        // Проверяем пароль
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Неверное имя пользователя или пароль' });
        }
        
        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            'your-secret-key',
            { expiresIn: '24h' }
        );
        
        // Убираем пароль из ответа
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Инициализация и запуск сервера
async function startServer() {
    console.log('🚀 Инициализация сервера...');
    
    try {
        // Инициализируем подключение к MySQL
        const dbInitialized = await db.initializeDatabase();
        if (!dbInitialized) {
            console.error('❌ Не удалось подключиться к базе данных. Сервер будет работать с ограниченной функциональностью.');
        } else {
            console.log('✅ База данных подключена успешно');
        }
        
        // Запускаем сервер
        app.listen(port, () => {
            console.log(`✅ Сервер запущен на порту ${port}`);
            console.log(`🌐 Сайт доступен по адресу: http://localhost:${port}`);
            console.log(`🔗 API доступен по адресу: http://localhost:${port}/api/`);
            console.log(`🧪 Тестовый эндпоинт: http://localhost:${port}/api/test`);
        });
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
}

startServer(); 