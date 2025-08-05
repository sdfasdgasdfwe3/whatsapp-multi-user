#!/usr/bin/env node

const http = require('http');
const url = require('url');
const db = require('./database');

const port = 3001;

// Простой CORS middleware
function setCORSHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', 'application/json');
}

// Парсинг JSON из тела запроса
function parseJSON(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({});
            }
        });
    });
}

// Создаем HTTP сервер
const server = http.createServer(async (req, res) => {
    setCORSHeaders(res);
    
    // Обработка preflight запросов
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    
    console.log(`${new Date().toISOString()} - ${req.method} ${path}`);
    
    try {
        // Тестовый эндпоинт
        if (path === '/api/test' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                message: 'Сервер работает!',
                timestamp: new Date().toISOString(),
                environment: 'production'
            }));
            return;
        }
        
        // Статус базы данных
        if (path === '/api/db-status' && req.method === 'GET') {
            try {
                const result = await db.getAllProducts();
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    dbConnected: result.success,
                    productsCount: result.success ? result.products.length : 0
                }));
            } catch (error) {
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: false,
                    dbConnected: false,
                    error: error.message
                }));
            }
            return;
        }
        
        // Получение продуктов
        if (path === '/api/products' && req.method === 'GET') {
            try {
                console.log('Запрос продуктов...');
                const result = await db.getAllProducts();
                if (result.success) {
                    console.log(`Получено ${result.products.length} продуктов`);
                    res.writeHead(200);
                    res.end(JSON.stringify(result));
                } else {
                    console.error('Ошибка получения продуктов:', result.error);
                    res.writeHead(500);
                    res.end(JSON.stringify(result));
                }
            } catch (error) {
                console.error('Ошибка получения продуктов:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: 'Ошибка сервера' }));
            }
            return;
        }
        
        // Создание продукта
        if (path === '/api/products' && req.method === 'POST') {
            try {
                const body = await parseJSON(req);
                console.log('Создание продукта:', body);
                
                const result = await db.createProduct({
                    name: body.name,
                    description: body.description,
                    price: parseFloat(body.price),
                    points: parseInt(body.points) || 0,
                    image: body.image || null
                });
                
                if (result.success) {
                    console.log('Продукт создан успешно, ID:', result.productId);
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true, productId: result.productId }));
                } else {
                    console.error('Ошибка создания продукта:', result.error);
                    res.writeHead(500);
                    res.end(JSON.stringify(result));
                }
            } catch (error) {
                console.error('Ошибка создания продукта:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: 'Ошибка сервера' }));
            }
            return;
        }
        
        // Получение статей
        if (path === '/api/articles' && req.method === 'GET') {
            try {
                const result = await db.getAllArticles();
                if (result.success) {
                    res.writeHead(200);
                    res.end(JSON.stringify(result));
                } else {
                    res.writeHead(500);
                    res.end(JSON.stringify(result));
                }
            } catch (error) {
                console.error('Ошибка получения статей:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: 'Ошибка сервера' }));
            }
            return;
        }
        
        // Аутентификация
        if (path === '/api/auth/login' && req.method === 'POST') {
            try {
                const body = await parseJSON(req);
                const { username, password } = body;
                
                // Ищем пользователя
                const user = await db.findUserByUsername(username);
                if (!user) {
                    res.writeHead(401);
                    res.end(JSON.stringify({ success: false, error: 'Неверное имя пользователя или пароль' }));
                    return;
                }
                
                // Проверяем пароль (упрощенно, без bcrypt)
                if (password !== user.password) {
                    res.writeHead(401);
                    res.end(JSON.stringify({ success: false, error: 'Неверное имя пользователя или пароль' }));
                    return;
                }
                
                // Убираем пароль из ответа
                const { password: _, ...userWithoutPassword } = user;
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    user: userWithoutPassword,
                    token: 'dummy-token'
                }));
            } catch (error) {
                console.error('Ошибка входа:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: 'Ошибка сервера' }));
            }
            return;
        }
        
        // 404 для неизвестных путей
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: 'Not Found' }));
        
    } catch (error) {
        console.error('Ошибка сервера:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: 'Внутренняя ошибка сервера' }));
    }
});

// Инициализация и запуск сервера
async function startSimpleServer() {
    console.log('🚀 Запуск упрощенного API сервера...');
    
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
        server.listen(port, '0.0.0.0', () => {
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

startSimpleServer(); 