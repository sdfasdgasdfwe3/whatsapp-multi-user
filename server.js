const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const https = require('https');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Создаем клиент WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'whatsapp-client',
        dataPath: './.wwebjs_auth'
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

// Получить статус подключения
app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        connected: isConnected,
        qrCode: qrCodeData,
        initializing: isInitializing
    });
});

// Получить QR-код
app.get('/api/whatsapp/qr', (req, res) => {
    console.log('QR request - isInitializing:', isInitializing, 'isConnected:', isConnected, 'qrCodeData:', !!qrCodeData);
    
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

// Отправить сообщение
app.post('/api/whatsapp/send', async (req, res) => {
    if (!isConnected) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    const { number, message } = req.body;
    
    try {
        // Форматируем номер телефона
        const formattedNumber = number.replace(/\D/g, '');
        const chatId = `${formattedNumber}@c.us`;
        
        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Получить чаты
app.get('/api/whatsapp/chats', async (req, res) => {
    if (!isConnected) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
        const chats = await client.getChats();
        
        // Разделяем чаты и группы
        const privateChats = [];
        const groupChats = [];
        
        for (const chat of chats) {
            let chatName = chat.name;
            
            // Если это приватный чат и имя не получено, пытаемся получить контакт
            if (!chat.isGroup && !chatName) {
                try {
                    const contact = await client.getContactById(chat.id._serialized);
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

// Получить информацию о контакте
app.get('/api/whatsapp/contact/:id', async (req, res) => {
    if (!isConnected) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
        const contactId = req.params.id;
        const contact = await client.getContactById(contactId);
        
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

// Отключить WhatsApp
app.post('/api/whatsapp/disconnect', async (req, res) => {
    try {
        await client.destroy();
        isConnected = false;
        qrCodeData = null;
        res.json({ success: true, message: 'WhatsApp disconnected' });
    } catch (error) {
        console.error('Error disconnecting:', error);
        res.status(500).json({ error: 'Failed to disconnect' });
    }
});

// Перезапустить WhatsApp клиент
app.post('/api/whatsapp/restart', async (req, res) => {
    try {
        console.log('Restarting WhatsApp client...');
        
        // Сбрасываем состояние
        isConnected = false;
        qrCodeData = null;
        isInitializing = true;
        
        // Останавливаем клиент
        try {
            await client.destroy();
        } catch (err) {
            console.log('Client already destroyed or error destroying:', err.message);
        }
        
        // Ждем немного и перезапускаем
        setTimeout(() => {
            console.log('Reinitializing WhatsApp client...');
            client.initialize().catch(err => {
                console.error('Error reinitializing WhatsApp client:', err);
                isInitializing = false;
            });
        }, 2000);
        
        res.json({ success: true, message: 'WhatsApp client restarting' });
    } catch (error) {
        console.error('Error restarting:', error);
        res.status(500).json({ error: 'Failed to restart' });
    }
});

// Очистить сессию WhatsApp
app.post('/api/whatsapp/clear-session', async (req, res) => {
    try {
        console.log('Clearing WhatsApp session...');
        
        // Сбрасываем состояние
        isConnected = false;
        qrCodeData = null;
        isInitializing = false;
        
        // Останавливаем клиент
        try {
            await client.destroy();
        } catch (err) {
            console.log('Client already destroyed or error destroying:', err.message);
        }
        
        res.json({ success: true, message: 'WhatsApp session cleared' });
    } catch (error) {
        console.error('Error clearing session:', error);
        res.status(500).json({ error: 'Failed to clear session' });
    }
});

app.listen(port, () => {
    console.log(`WhatsApp server running on port ${port}`);
}); 