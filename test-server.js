#!/usr/bin/env node

const http = require('http');
const url = require('url');

const port = 3001;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', 'application/json');
    
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    
    console.log(`${new Date().toISOString()} - ${req.method} ${path}`);
    
    // OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Test endpoint
    if (path === '/api/test' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            message: 'Тестовый сервер работает!',
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    // Products endpoint
    if (path === '/api/products' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            products: [
                {
                    id: 1,
                    name: 'Тестовый продукт',
                    description: 'Это тестовый продукт',
                    price: '1000 ₽',
                    points: 10,
                    image: 'https://via.placeholder.com/200x200/667eea/ffffff?text=Тест'
                }
            ]
        }));
        return;
    }
    
    // Articles endpoint
    if (path === '/api/articles' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            articles: [
                {
                    id: 1,
                    title: 'Тестовая статья',
                    content: 'Это тестовая статья для проверки работы сервера',
                    author: 'Тест',
                    created_at: new Date().toISOString(),
                    image: 'https://via.placeholder.com/200x200/667eea/ffffff?text=Статья'
                }
            ]
        }));
        return;
    }
    
    // 404
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, error: 'Not Found' }));
});

server.listen(port, '0.0.0.0', () => {
    console.log(`✅ Тестовый сервер запущен на порту ${port}`);
    console.log(`🌐 API доступен по адресу: http://89.104.66.62:${port}/api/`);
    console.log(`🧪 Тестовый эндпоинт: http://89.104.66.62:${port}/api/test`);
});

server.on('error', (error) => {
    console.error('❌ Ошибка сервера:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.log(`💡 Порт ${port} занят. Попробуйте другой порт.`);
    }
    process.exit(1);
}); 