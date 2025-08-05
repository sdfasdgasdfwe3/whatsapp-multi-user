#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const port = 3001;

// Настройка CORS для продакшена
app.use(cors({
    origin: ['http://89.104.66.62', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.static('.'));

// Обработчик для preflight запросов
app.options('*', cors());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Тестовый эндпоинт
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Сервер работает!',
        timestamp: new Date().toISOString(),
        environment: 'production'
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
        console.error('Ошибка проверки БД:', error);
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
        console.log('Запрос продуктов...');
        const result = await db.getAllProducts();
        if (result.success) {
            console.log(`Получено ${result.products.length} продуктов`);
            res.json(result);
        } else {
            console.error('Ошибка получения продуктов:', result.error);
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка получения продуктов:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        console.log('Создание продукта:', req.body);
        const { name, description, price, points, image } = req.body;
        
        const result = await db.createProduct({
            name,
            description,
            price: parseFloat(price),
            points: parseInt(points) || 0,
            image: image || null
        });
        
        if (result.success) {
            console.log('Продукт создан успешно, ID:', result.productId);
            res.json({ success: true, productId: result.productId });
        } else {
            console.error('Ошибка создания продукта:', result.error);
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка создания продукта:', error);
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

// Обработчик ошибок
app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Инициализация и запуск сервера
async function startProductionServer() {
    console.log('🚀 Запуск продакшен сервера...');
    
    try {
        // Инициализируем подключение к MySQL
        console.log('📊 Подключение к базе данных...');
        const dbInitialized = await db.initializeDatabase();
        if (!dbInitialized) {
            console.error('❌ Не удалось подключиться к базе данных. Сервер будет работать с ограниченной функциональностью.');
        } else {
            console.log('✅ База данных подключена успешно');
        }
        
        // Запускаем сервер
        app.listen(port, '0.0.0.0', () => {
            console.log(`✅ Сервер запущен на порту ${port}`);
            console.log(`🌐 API доступен по адресу: http://89.104.66.62:${port}/api/`);
            console.log(`🧪 Тестовый эндпоинт: http://89.104.66.62:${port}/api/test`);
            console.log(`📊 Статус БД: http://89.104.66.62:${port}/api/db-status`);
        });
    } catch (error) {
        console.error('❌ Ошибка запуска сервера:', error);
        process.exit(1);
    }
}

startProductionServer(); 