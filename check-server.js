#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://89.104.66.62:3001';

async function checkServer() {
    console.log('🔍 Проверка состояния сервера...\n');

    try {
        // Проверяем доступность порта 3001
        console.log('1️⃣ Проверка порта 3001...');
        const testRequest = http.get(`${BASE_URL}/api/test`, (res) => {
            console.log(`✅ Порт 3001 доступен (статус: ${res.statusCode})`);
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('📋 Ответ сервера:', response.message);
                } catch (e) {
                    console.log('📋 Ответ сервера (не JSON):', data.substring(0, 100));
                }
            });
        });

        testRequest.on('error', (err) => {
            console.log('❌ Порт 3001 недоступен:', err.message);
            console.log('\n💡 Возможные причины:');
            console.log('1. Сервер не запущен');
            console.log('2. Порт заблокирован');
            console.log('3. Firewall блокирует подключение');
        });

        testRequest.setTimeout(5000, () => {
            console.log('⏰ Таймаут подключения к порту 3001');
            testRequest.destroy();
        });

    } catch (error) {
        console.error('❌ Ошибка проверки:', error.message);
    }
}

checkServer(); 