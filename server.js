const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const https = require('https');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Импортируем модуль для работы с базой данных
const db = require('./database');

const app = express();
const port = 3001;

// Настройка CORS для разрешения запросов с любого домена
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    next();
});
app.use(express.json());
app.use(express.static('.'));

// Обработчик для preflight запросов
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.sendStatus(200);
});

// Хранилище активных клиентов WhatsApp для разных пользователей
const activeClients = new Map();

// Функция для создания клиента WhatsApp для конкретного пользователя
function createWhatsAppClient(userId) {
    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: `whatsapp-client-${userId}`,
            dataPath: `./.wwebjs_auth/user_${userId}`
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-field-trial-config',
                '--disable-ipc-flooding-protection',
                '--enable-logging',
                '--log-level=0',
                '--force-color-profile=srgb',
                '--metrics-recording-only',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--mute-audio',
                '--no-default-browser-check',
                '--safebrowsing-disable-auto-update',
                '--disable-client-side-phishing-detection',
                '--disable-component-update',
                '--disable-domain-reliability',
                '--disable-hang-monitor',
                '--disable-prompt-on-repost',
                '--disable-background-networking',
                '--disable-background-downloads',
                '--disable-background-upload'
            ],
            timeout: 60000,
            protocolTimeout: 60000
        }
    });

    let qrCodeData = null;
    let isConnected = false;
    let isInitializing = true;

    // Генерируем QR-код для подключения
    client.on('qr', async (qr) => {
        console.log(`QR Code received for user ${userId}:`, qr);
        isInitializing = false;
        
        try {
            const qrImage = await qrcode.toDataURL(qr);
            qrCodeData = qrImage;
            console.log(`QR code image generated successfully for user ${userId}`);
        } catch (err) {
            console.error(`Error generating QR code for user ${userId}:`, err);
            qrCodeData = qr;
        }
    });

    // Когда клиент готов
    client.on('ready', () => {
        console.log(`WhatsApp client is ready for user ${userId}!`);
        isConnected = true;
        isInitializing = false;
        qrCodeData = null;
    });

    // Когда клиент отключается
    client.on('disconnected', (reason) => {
        console.log(`WhatsApp client was disconnected for user ${userId}:`, reason);
        isConnected = false;
        qrCodeData = null;
        isInitializing = false;
    });

    // Обработчик ошибок авторизации
    client.on('auth_failure', (msg) => {
        console.log(`Auth failure for user ${userId}:`, msg);
        isConnected = false;
        qrCodeData = null;
        isInitializing = false;
    });

    // Функция для проверки интернет-соединения
    function checkInternetConnection() {
        return new Promise((resolve) => {
            const req = https.get('https://www.google.com', (res) => {
                resolve(true);
            });
            
            req.on('error', (err) => {
                console.log('Internet connection check failed:', err.message);
                resolve(false);
            });
            
            req.setTimeout(5000, () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    // Функция для инициализации клиента с повторными попытками
    async function initializeClient(retryCount = 0) {
        const maxRetries = 3;
        
        try {
            console.log(`Attempting to initialize WhatsApp client for user ${userId} (attempt ${retryCount + 1}/${maxRetries + 1})...`);
            
            const hasInternet = await checkInternetConnection();
            if (!hasInternet) {
                throw new Error('No internet connection available');
            }
            
            await client.initialize();
        } catch (err) {
            console.error(`Error initializing WhatsApp client for user ${userId} (attempt ${retryCount + 1}):`, err.message);
            
            if (retryCount < maxRetries) {
                console.log(`Retrying in 5 seconds...`);
                setTimeout(() => {
                    initializeClient(retryCount + 1);
                }, 5000);
            } else {
                console.error(`Max retries reached for user ${userId}. WhatsApp client initialization failed.`);
                isInitializing = false;
            }
        }
    }

    // Инициализируем клиент
    initializeClient();

    return {
        client,
        getStatus: () => ({ isConnected, isInitializing, qrCodeData }),
        getClient: () => client
    };
}

// Инициализация базы данных
async function initializeServer() {
    console.log('🚀 Инициализация сервера...');
    
    // Инициализируем подключение к MySQL
    const dbInitialized = await db.initializeDatabase();
    if (!dbInitialized) {
        console.error('❌ Не удалось подключиться к базе данных. Сервер будет работать с ограниченной функциональностью.');
    }
    
    // Запускаем сервер
    app.listen(port, () => {
        console.log(`✅ Сервер запущен на порту ${port}`);
        console.log(`🌐 Сайт доступен по адресу: http://localhost:${port}`);
    });
}

// Запускаем инициализацию
initializeServer();

// Генерируем QR-код для подключения
client.on('qr', async (qr) => {
    console.log('QR Code received:', qr);
    isInitializing = false;
    qrCodeData = qr;
    
    // Генерируем QR-код как изображение
    try {
        const qrImage = await qrcode.toDataURL(qr);
        qrCodeData = qrImage;
        console.log('QR code image generated successfully');
    } catch (err) {
        console.error('Error generating QR code:', err);
    }
});

// Когда клиент готов
client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isConnected = true;
    isInitializing = false;
    qrCodeData = null;
});

// Когда клиент отключается
client.on('disconnected', (reason) => {
    console.log('WhatsApp client was disconnected:', reason);
    isConnected = false;
    qrCodeData = null;
    isInitializing = false;
});

// Функция для проверки интернет-соединения
function checkInternetConnection() {
    return new Promise((resolve) => {
        const req = https.get('https://www.google.com', (res) => {
            resolve(true);
        });
        
        req.on('error', (err) => {
            console.log('Internet connection check failed:', err.message);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// Функция для инициализации клиента с повторными попытками
async function initializeClient(retryCount = 0) {
    const maxRetries = 3;
    
    try {
        console.log(`Attempting to initialize WhatsApp client (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        
        // Проверяем интернет-соединение
        const hasInternet = await checkInternetConnection();
        if (!hasInternet) {
            throw new Error('No internet connection available');
        }
        
        await client.initialize();
    } catch (err) {
        console.error(`Error initializing WhatsApp client (attempt ${retryCount + 1}):`, err.message);
        
        if (retryCount < maxRetries) {
            console.log(`Retrying in 5 seconds...`);
            setTimeout(() => {
                initializeClient(retryCount + 1);
            }, 5000);
        } else {
            console.error('Max retries reached. WhatsApp client initialization failed.');
            isInitializing = false;
        }
    }
}

// Инициализируем клиент
initializeClient();

// Добавляем обработчик ошибок
client.on('auth_failure', (msg) => {
    console.log('Auth failure:', msg);
    isConnected = false;
    qrCodeData = null;
    isInitializing = false;
});

// API endpoints

// Получить статус подключения для пользователя
app.get('/api/whatsapp/status/:userId', (req, res) => {
    const userId = req.params.userId;
    
    if (!activeClients.has(userId)) {
        return res.json({
            connected: false,
            qrCode: null,
            initializing: false,
            error: 'Client not initialized'
        });
    }
    
    const { isConnected, isInitializing, qrCodeData } = activeClients.get(userId).getStatus();
    
    res.json({
        connected: isConnected,
        qrCode: qrCodeData,
        initializing: isInitializing
    });
});

// Получить QR-код для пользователя
app.get('/api/whatsapp/qr/:userId', (req, res) => {
    const userId = req.params.userId;
    
    console.log(`QR request for user ${userId}`);
    
    if (!activeClients.has(userId)) {
        console.log(`Creating new WhatsApp client for user ${userId}`);
        // Создаем клиент для пользователя
        const clientWrapper = createWhatsAppClient(userId);
        activeClients.set(userId, clientWrapper);
    }
    
    const { isConnected, isInitializing, qrCodeData } = activeClients.get(userId).getStatus();
    
    console.log(`QR request for user ${userId} - isInitializing: ${isInitializing} isConnected: ${isConnected} qrCodeData: ${!!qrCodeData}`);
    
    if (isInitializing) {
        res.json({ error: 'Initializing WhatsApp client, please wait...' });
    } else if (qrCodeData) {
        res.json({ qrCode: qrCodeData });
    } else if (isConnected) {
        res.json({ connected: true });
    } else {
        res.json({ error: 'QR code not available, try again in a few seconds' });
    }
});

// Отправить сообщение от имени пользователя
app.post('/api/whatsapp/send/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { number, message } = req.body;
    
    if (!activeClients.has(userId)) {
        return res.status(400).json({ error: 'WhatsApp client not initialized' });
    }
    
    const clientWrapper = activeClients.get(userId);
    const { isConnected } = clientWrapper.getStatus();
    
    if (!isConnected) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
        // Форматируем номер телефона
        const formattedNumber = number.replace(/\D/g, '');
        const chatId = `${formattedNumber}@c.us`;
        
        await clientWrapper.getClient().sendMessage(chatId, message);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Получить чаты для пользователя
app.get('/api/whatsapp/chats/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    if (!activeClients.has(userId)) {
        return res.status(400).json({ error: 'WhatsApp client not initialized' });
    }
    
    const clientWrapper = activeClients.get(userId);
    const { isConnected } = clientWrapper.getStatus();
    
    if (!isConnected) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
        const chats = await clientWrapper.getClient().getChats();
        
        // Разделяем чаты и группы
        const privateChats = [];
        const groupChats = [];
        
        for (const chat of chats) {
            let chatName = chat.name;
            
            // Если это приватный чат и имя не получено, пытаемся получить контакт
            if (!chat.isGroup && !chatName) {
                try {
                    const contact = await clientWrapper.getClient().getContactById(chat.id._serialized);
                    if (contact && contact.pushname) {
                        chatName = contact.pushname;
                    } else if (contact && contact.name) {
                        chatName = contact.name;
                    } else {
                        // Если имя не найдено, форматируем номер телефона
                        const phoneNumber = chat.id.user;
                        chatName = `+${phoneNumber.slice(0, 1)} ${phoneNumber.slice(1, 4)} ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
                    }
                } catch (contactError) {
                    console.log('Error getting contact info:', contactError.message);
                    // Форматируем номер телефона как fallback
                    const phoneNumber = chat.id.user;
                    chatName = `+${phoneNumber.slice(0, 1)} ${phoneNumber.slice(1, 4)} ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
                }
            }
            
            const chatData = {
                id: chat.id._serialized,
                name: chatName || chat.id.user
            };
            
            if (chat.isGroup) {
                groupChats.push(chatData);
            } else {
                privateChats.push(chatData);
            }
        }
        
        res.json({ 
            privateChats: privateChats,
            groupChats: groupChats
        });
    } catch (error) {
        console.error('Error getting chats:', error);
        res.status(500).json({ error: 'Failed to get chats' });
    }
});

// Получить информацию о контакте для пользователя
app.get('/api/whatsapp/contact/:userId/:contactId', async (req, res) => {
    const userId = req.params.userId;
    const contactId = req.params.contactId;
    
    if (!activeClients.has(userId)) {
        return res.status(400).json({ error: 'WhatsApp client not initialized' });
    }
    
    const clientWrapper = activeClients.get(userId);
    const { isConnected } = clientWrapper.getStatus();
    
    if (!isConnected) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
        const contact = await clientWrapper.getClient().getContactById(contactId);
        
        if (contact) {
            res.json({
                id: contact.id._serialized,
                name: contact.name || contact.pushname || contact.id.user,
                pushname: contact.pushname,
                number: contact.id.user,
                isGroup: contact.isGroup || false
            });
        } else {
            res.status(404).json({ error: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error getting contact:', error);
        res.status(500).json({ error: 'Failed to get contact' });
    }
});

// Отключить WhatsApp для пользователя
app.post('/api/whatsapp/disconnect/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    if (!activeClients.has(userId)) {
        return res.status(400).json({ error: 'Client not found' });
    }
    
    try {
        const clientWrapper = activeClients.get(userId);
        await clientWrapper.getClient().destroy();
        activeClients.delete(userId);
        
        res.json({ success: true, message: 'WhatsApp disconnected' });
    } catch (error) {
        console.error('Error disconnecting:', error);
        res.status(500).json({ error: 'Failed to disconnect' });
    }
});

// Перезапустить WhatsApp клиент для пользователя
app.post('/api/whatsapp/restart/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        console.log(`Restarting WhatsApp client for user ${userId}...`);
        
        // Удаляем существующий клиент
        if (activeClients.has(userId)) {
            try {
                await activeClients.get(userId).getClient().destroy();
            } catch (err) {
                console.log('Client already destroyed or error destroying:', err.message);
            }
            activeClients.delete(userId);
        }
        
        // Создаем новый клиент
        const clientWrapper = createWhatsAppClient(userId);
        activeClients.set(userId, clientWrapper);
        
        res.json({ success: true, message: 'WhatsApp client restarting' });
    } catch (error) {
        console.error('Error restarting:', error);
        res.status(500).json({ error: 'Failed to restart' });
    }
});

// Очистить сессию WhatsApp для пользователя
app.post('/api/whatsapp/clear-session/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        console.log(`Clearing WhatsApp session for user ${userId}...`);
        
        // Удаляем клиент
        if (activeClients.has(userId)) {
            try {
                await activeClients.get(userId).getClient().destroy();
            } catch (err) {
                console.log('Client already destroyed or error destroying:', err.message);
            }
            activeClients.delete(userId);
        }
        
        res.json({ success: true, message: 'WhatsApp session cleared' });
    } catch (error) {
        console.error('Error clearing session:', error);
        res.status(500).json({ error: 'Failed to clear session' });
    }
});

// ===== MIDDLEWARE ДЛЯ АУТЕНТИФИКАЦИИ =====

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }
    
    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Middleware для проверки роли администратора
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
}

// ===== API ЭНДПОИНТЫ ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ =====

// Тестовый эндпоинт для проверки работы сервера
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Сервер работает!',
        timestamp: new Date().toISOString()
    });
});

// Эндпоинт для проверки статуса базы данных
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

// Аутентификация пользователей
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, fullName, email } = req.body;
        
        // Проверяем, существует ли пользователь
        const existingUser = await db.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Пользователь с таким именем уже существует' });
        }
        
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Создаем пользователя
        const result = await db.createUser({
            username,
            password: hashedPassword,
            fullName,
            email,
            role: 'user'
        });
        
        if (result.success) {
            res.json({ success: true, message: 'Пользователь успешно зарегистрирован' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

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
            'your-secret-key', // В продакшене используйте переменную окружения
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

// Создание продукта (только для администраторов)
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, description, price, points, image } = req.body;
        
        const result = await db.createProduct({
            name,
            description,
            price: parseFloat(price),
            points: parseInt(points) || 0,
            image: image || null
        });
        
        if (result.success) {
            res.json({ success: true, productId: result.productId });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка создания продукта:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Обновление продукта (только для администраторов)
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, points, image } = req.body;
        
        const result = await db.updateProduct(parseInt(id), {
            name,
            description,
            price: parseFloat(price),
            points: parseInt(points) || 0,
            image: image || null
        });
        
        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка обновления продукта:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Удаление продукта (только для администраторов)
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.deleteProduct(parseInt(id));
        
        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка удаления продукта:', error);
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

// Создание статьи (только для администраторов)
app.post('/api/articles', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, content, author, image } = req.body;
        
        const result = await db.createArticle({
            title,
            content,
            author,
            image: image || null
        });
        
        if (result.success) {
            res.json({ success: true, articleId: result.articleId });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка создания статьи:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Обновление статьи (только для администраторов)
app.put('/api/articles/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author, image } = req.body;
        
        const result = await db.updateArticle(parseInt(id), {
            title,
            content,
            author,
            image: image || null
        });
        
        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка обновления статьи:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Удаление статьи (только для администраторов)
app.delete('/api/articles/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.deleteArticle(parseInt(id));
        
        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка удаления статьи:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ =====

// Получить всех пользователей (только для администраторов)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.getAllUsers();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Получить профиль текущего пользователя
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.findUserById(req.user.userId);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json({ success: true, user: userWithoutPassword });
        } else {
            res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка получения профиля:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Обновить профиль пользователя
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        
        const result = await db.updateUser(req.user.userId, {
            fullName,
            email
        });
        
        if (result.success) {
            res.json({ success: true, message: 'Профиль обновлен успешно' });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Изменить роль пользователя (только для администраторов)
app.put('/api/admin/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Неверная роль' });
        }
        
        const result = await db.updateUserRole(parseInt(userId), role);
        
        if (result.success) {
            res.json({ success: true, message: 'Роль пользователя обновлена' });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка обновления роли:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Удалить пользователя (только для администраторов)
app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Нельзя удалить самого себя
        if (parseInt(userId) === req.user.userId) {
            return res.status(400).json({ success: false, error: 'Нельзя удалить самого себя' });
        }
        
        const result = await db.deleteUser(parseInt(userId));
        
        if (result.success) {
            res.json({ success: true, message: 'Пользователь удален успешно' });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// API для чатов
app.get('/api/chats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.getUserChats(parseInt(userId));
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка получения чатов:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.post('/api/chats', async (req, res) => {
    try {
        const { userId, contactName, contactNumber, lastMessage } = req.body;
        
        const result = await db.createChat({
            userId: parseInt(userId),
            contactName,
            contactNumber,
            lastMessage
        });
        
        if (result.success) {
            res.json({ success: true, chatId: result.chatId });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка создания чата:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// API для сообщений
app.get('/api/messages/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const result = await db.getChatMessages(parseInt(chatId));
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const { chatId, messageText, isFromMe } = req.body;
        
        const result = await db.createMessage({
            chatId: parseInt(chatId),
            messageText,
            isFromMe: Boolean(isFromMe)
        });
        
        if (result.success) {
            // Обновляем последнее сообщение в чате
            await db.updateChatLastMessage(parseInt(chatId), messageText);
            
            res.json({ success: true, messageId: result.messageId });
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Ошибка создания сообщения:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// ===== API ДЛЯ СТАТИСТИКИ И МОНИТОРИНГА =====

// Получить статистику системы (только для администраторов)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Получаем статистику пользователей
        const usersResult = await db.getAllUsers();
        const productsResult = await db.getAllProducts();
        const articlesResult = await db.getAllArticles();
        
        const stats = {
            users: {
                total: usersResult.success ? usersResult.users.length : 0,
                admins: usersResult.success ? usersResult.users.filter(u => u.role === 'admin').length : 0,
                regular: usersResult.success ? usersResult.users.filter(u => u.role === 'user').length : 0
            },
            products: {
                total: productsResult.success ? productsResult.products.length : 0
            },
            articles: {
                total: articlesResult.success ? articlesResult.articles.length : 0
            },
            whatsapp: {
                activeClients: activeClients.size,
                connectedClients: Array.from(activeClients.values()).filter(client => client.getStatus().isConnected).length
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            }
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Ошибка получения статистики:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

// Получить активные WhatsApp сессии (только для администраторов)
app.get('/api/admin/whatsapp-sessions', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const sessions = [];
        
        for (const [userId, clientWrapper] of activeClients) {
            const status = clientWrapper.getStatus();
            sessions.push({
                userId: parseInt(userId),
                connected: status.isConnected,
                initializing: status.isInitializing,
                hasQrCode: !!status.qrCodeData
            });
        }
        
        res.json({ success: true, sessions });
    } catch (error) {
        console.error('Ошибка получения сессий WhatsApp:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});