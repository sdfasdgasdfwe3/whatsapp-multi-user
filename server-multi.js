const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors({
    origin: ['http://znam.fun', 'https://znam.fun', 'http://www.znam.fun', 'https://www.znam.fun', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('.'));

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'unknown'}`);
    next();
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Загружаем базу данных
function loadDatabase() {
    try {
        const data = fs.readFileSync('database.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading database:', error);
        return { users: [], whatsappSessions: {}, messages: [] };
    }
}

// Сохраняем базу данных
function saveDatabase(db) {
    try {
        fs.writeFileSync('database.json', JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// Хранилище активных клиентов WhatsApp
const activeClients = new Map();

// Создание клиента WhatsApp для пользователя
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
            // Генерируем QR-код как Data URL
            const qrImage = await qrcode.toDataURL(qr, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                quality: 0.92,
                margin: 1
            });
            qrCodeData = qrImage;
            console.log(`QR code image generated successfully for user ${userId}`);
        } catch (err) {
            console.error(`Error generating QR code for user ${userId}:`, err);
            // Если не удалось сгенерировать изображение, сохраняем текстовый QR-код
            qrCodeData = qr;
        }
    });

    // Когда клиент готов
    client.on('ready', () => {
        console.log(`WhatsApp client is ready for user ${userId}!`);
        isConnected = true;
        isInitializing = false;
        qrCodeData = null;
        
        // Обновляем базу данных
        const db = loadDatabase();
        if (!db.whatsappSessions[userId]) {
            db.whatsappSessions[userId] = {};
        }
        db.whatsappSessions[userId].connected = true;
        db.whatsappSessions[userId].lastConnected = new Date().toISOString();
        saveDatabase(db);
    });

    // Когда клиент отключается
    client.on('disconnected', (reason) => {
        console.log(`WhatsApp client was disconnected for user ${userId}:`, reason);
        isConnected = false;
        qrCodeData = null;
        isInitializing = false;
        
        // Обновляем базу данных
        const db = loadDatabase();
        if (db.whatsappSessions[userId]) {
            db.whatsappSessions[userId].connected = false;
            db.whatsappSessions[userId].lastDisconnected = new Date().toISOString();
        }
        saveDatabase(db);
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

// API endpoints

// Аутентификация пользователя
app.post('/api/auth/login', (req, res) => {
    console.log('Login attempt:', { username: req.body.username, password: req.body.password ? '***' : 'missing' });
    
    const { username, password } = req.body;
    const db = loadDatabase();
    
    console.log('Database loaded, users count:', db.users.length);
    
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        console.log('User found:', { id: user.id, username: user.username, fullName: user.fullName });
        // Убираем пароль из ответа
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } else {
        console.log('User not found or invalid password');
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// Регистрация нового пользователя
app.post('/api/auth/register', (req, res) => {
    const { username, password, fullName, phone } = req.body;
    const db = loadDatabase();
    
    // Проверяем, что пользователь с таким именем не существует
    const existingUser = db.users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ success: false, error: 'Username already exists' });
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: Date.now(), // Простой способ генерации ID
        username: username,
        password: password,
        fullName: fullName || username,
        phone: phone || '',
        role: 'user',
        whatsappSession: null,
        createdAt: new Date().toISOString()
    };
    
    // Добавляем пользователя в базу данных
    db.users.push(newUser);
    saveDatabase(db);
    
    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
});

// Получить статус WhatsApp для пользователя
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
        const formattedNumber = number.replace(/\D/g, '');
        const chatId = `${formattedNumber}@c.us`;
        
        await clientWrapper.getClient().sendMessage(chatId, message);
        
        // Сохраняем сообщение в базу данных
        const db = loadDatabase();
        db.messages.push({
            id: Date.now(),
            userId: parseInt(userId),
            number: formattedNumber,
            message: message,
            timestamp: new Date().toISOString()
        });
        saveDatabase(db);
        
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
        
        const privateChats = [];
        const groupChats = [];
        
        for (const chat of chats) {
            let chatName = chat.name;
            
            if (!chat.isGroup && !chatName) {
                try {
                    const contact = await clientWrapper.getClient().getContactById(chat.id._serialized);
                    if (contact && contact.pushname) {
                        chatName = contact.pushname;
                    } else if (contact && contact.name) {
                        chatName = contact.name;
                    } else {
                        const phoneNumber = chat.id.user;
                        chatName = `+${phoneNumber.slice(0, 1)} ${phoneNumber.slice(1, 4)} ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
                    }
                } catch (contactError) {
                    console.log('Error getting contact info:', contactError.message);
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
        
        // Обновляем базу данных
        const db = loadDatabase();
        if (db.whatsappSessions[userId]) {
            db.whatsappSessions[userId].connected = false;
            db.whatsappSessions[userId].lastDisconnected = new Date().toISOString();
        }
        saveDatabase(db);
        
        res.json({ success: true, message: 'WhatsApp disconnected' });
    } catch (error) {
        console.error('Error disconnecting:', error);
        res.status(500).json({ error: 'Failed to disconnect' });
    }
});

// Получить статистику сообщений
app.get('/api/messages/stats/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const db = loadDatabase();
    
    const userMessages = db.messages.filter(msg => msg.userId === userId);
    const today = new Date().toDateString();
    const todayMessages = userMessages.filter(msg => new Date(msg.timestamp).toDateString() === today);
    
    res.json({
        total: userMessages.length,
        today: todayMessages.length,
        lastMessage: userMessages.length > 0 ? userMessages[userMessages.length - 1] : null
    });
});

// Получить всех пользователей (только для администраторов)
app.get('/api/admin/users', (req, res) => {
    const db = loadDatabase();
    
    // Убираем пароли из ответа
    const usersWithoutPasswords = db.users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
    
    res.json({ users: usersWithoutPasswords });
});

// Изменить роль пользователя (только для администраторов)
app.post('/api/admin/users/:userId/role', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { role } = req.body;
    
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    
    const db = loadDatabase();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    user.role = role;
    saveDatabase(db);
    
    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
});

// Удалить пользователя (только для администраторов)
app.delete('/api/admin/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const db = loadDatabase();
    
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Нельзя удалить главного администратора
    if (db.users[userIndex].username === 'admin') {
        return res.status(400).json({ success: false, error: 'Cannot delete main administrator' });
    }
    
    db.users.splice(userIndex, 1);
    saveDatabase(db);
    
    res.json({ success: true, message: 'User deleted successfully' });
});

// Отладочный endpoint для проверки базы данных (временно)
app.get('/api/debug/database', (req, res) => {
    try {
        const db = loadDatabase();
        const usersForDebug = db.users.map(user => ({
            id: user.id,
            username: user.username,
            password: user.password ? user.password.substring(0, 3) + '***' : 'no password',
            fullName: user.fullName,
            role: user.role
        }));
        
        res.json({
            success: true,
            usersCount: db.users.length,
            users: usersForDebug,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Debug database error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API для продуктов
app.get('/api/products', (req, res) => {
    try {
        const db = loadDatabase();
        res.json({ success: true, products: db.products || [] });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const db = loadDatabase();
        const product = (db.products || []).find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        res.json({ success: true, product });
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Добавить новый продукт (только для администраторов)
app.post('/api/products', (req, res) => {
    try {
        const { name, price, description, image, category } = req.body;
        
        if (!name || !price || !description) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        const db = loadDatabase();
        const newProduct = {
            id: Date.now(),
            name,
            price,
            description,
            image: image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`,
            category: category || 'Другое',
            createdAt: new Date().toISOString()
        };
        
        if (!db.products) {
            db.products = [];
        }
        
        db.products.push(newProduct);
        saveDatabase(db);
        
        res.json({ success: true, product: newProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Обновить продукт (только для администраторов)
app.put('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, price, description, image, category } = req.body;
        
        const db = loadDatabase();
        const productIndex = (db.products || []).findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        const updatedProduct = {
            ...db.products[productIndex],
            name: name || db.products[productIndex].name,
            price: price || db.products[productIndex].price,
            description: description || db.products[productIndex].description,
            image: image || db.products[productIndex].image,
            category: category || db.products[productIndex].category
        };
        
        db.products[productIndex] = updatedProduct;
        saveDatabase(db);
        
        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Удалить продукт (только для администраторов)
app.delete('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const db = loadDatabase();
        
        const productIndex = (db.products || []).findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        const deletedProduct = db.products[productIndex];
        db.products.splice(productIndex, 1);
        saveDatabase(db);
        
        res.json({ success: true, message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API для статей
app.get('/api/articles', (req, res) => {
    try {
        const db = loadDatabase();
        res.json({ success: true, articles: db.articles || [] });
    } catch (error) {
        console.error('Error getting articles:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/articles/:id', (req, res) => {
    try {
        const articleId = parseInt(req.params.id);
        const db = loadDatabase();
        const article = (db.articles || []).find(a => a.id === articleId);
        
        if (!article) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        
        res.json({ success: true, article });
    } catch (error) {
        console.error('Error getting article:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Добавить новую статью (только для администраторов)
app.post('/api/articles', (req, res) => {
    try {
        const { title, content, author, category, image } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        
        const db = loadDatabase();
        const newArticle = {
            id: Date.now(),
            title,
            date: new Date().toISOString().split('T')[0],
            content,
            image: image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(title)}`,
            author: author || 'Администратор',
            category: category || 'Общее',
            createdAt: new Date().toISOString()
        };
        
        if (!db.articles) {
            db.articles = [];
        }
        
        db.articles.push(newArticle);
        saveDatabase(db);
        
        res.json({ success: true, article: newArticle });
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Обновить статью (только для администраторов)
app.put('/api/articles/:id', (req, res) => {
    try {
        const articleId = parseInt(req.params.id);
        const { title, content, author, category, image } = req.body;
        
        const db = loadDatabase();
        const articleIndex = (db.articles || []).findIndex(a => a.id === articleId);
        
        if (articleIndex === -1) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        
        const updatedArticle = {
            ...db.articles[articleIndex],
            title: title || db.articles[articleIndex].title,
            content: content || db.articles[articleIndex].content,
            author: author || db.articles[articleIndex].author,
            category: category || db.articles[articleIndex].category,
            image: image || db.articles[articleIndex].image
        };
        
        db.articles[articleIndex] = updatedArticle;
        saveDatabase(db);
        
        res.json({ success: true, article: updatedArticle });
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Удалить статью (только для администраторов)
app.delete('/api/articles/:id', (req, res) => {
    try {
        const articleId = parseInt(req.params.id);
        const db = loadDatabase();
        
        const articleIndex = (db.articles || []).findIndex(a => a.id === articleId);
        
        if (articleIndex === -1) {
            return res.status(404).json({ success: false, error: 'Article not found' });
        }
        
        const deletedArticle = db.articles[articleIndex];
        db.articles.splice(articleIndex, 1);
        saveDatabase(db);
        
        res.json({ success: true, message: 'Article deleted successfully', article: deletedArticle });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API для акций
app.get('/api/promotions', (req, res) => {
    try {
        const db = loadDatabase();
        res.json({ success: true, promotions: db.promotions || [] });
    } catch (error) {
        console.error('Error getting promotions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/promotions/:id', (req, res) => {
    try {
        const promotionId = parseInt(req.params.id);
        const db = loadDatabase();
        const promotion = (db.promotions || []).find(p => p.id === promotionId);
        
        if (!promotion) {
            return res.status(404).json({ success: false, error: 'Promotion not found' });
        }
        
        res.json({ success: true, promotion });
    } catch (error) {
        console.error('Error getting promotion:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Multi-user WhatsApp server running on port ${port}`);
}); 