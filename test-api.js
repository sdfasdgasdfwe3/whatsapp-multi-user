#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = 'http://89.104.66.62:3001';

async function testAPI() {
    console.log('🧪 Тестирование API...\n');

    try {
        // Тест 1: Проверка доступности сервера
        console.log('1️⃣ Тестирование доступности сервера...');
        const testResponse = await fetch(`${BASE_URL}/api/test`);
        if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('✅ Сервер доступен:', testData.message);
        } else {
            console.log('❌ Сервер недоступен');
            return;
        }

        // Тест 2: Проверка статуса базы данных
        console.log('\n2️⃣ Тестирование подключения к базе данных...');
        const dbResponse = await fetch(`${BASE_URL}/api/db-status`);
        if (dbResponse.ok) {
            const dbData = await dbResponse.json();
            if (dbData.dbConnected) {
                console.log('✅ База данных подключена');
                console.log(`📊 Количество продуктов: ${dbData.productsCount}`);
            } else {
                console.log('❌ База данных не подключена');
            }
        } else {
            console.log('❌ Ошибка проверки базы данных');
        }

        // Тест 3: Получение продуктов
        console.log('\n3️⃣ Тестирование получения продуктов...');
        const productsResponse = await fetch(`${BASE_URL}/api/products`);
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            if (productsData.success) {
                console.log(`✅ Получено ${productsData.products.length} продуктов`);
                if (productsData.products.length > 0) {
                    console.log(`📦 Первый продукт: ${productsData.products[0].name}`);
                }
            } else {
                console.log('❌ Ошибка получения продуктов:', productsData.error);
            }
        } else {
            console.log('❌ Ошибка запроса продуктов');
        }

        // Тест 4: Получение статей
        console.log('\n4️⃣ Тестирование получения статей...');
        const articlesResponse = await fetch(`${BASE_URL}/api/articles`);
        if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            if (articlesData.success) {
                console.log(`✅ Получено ${articlesData.articles.length} статей`);
                if (articlesData.articles.length > 0) {
                    console.log(`📰 Первая статья: ${articlesData.articles[0].title}`);
                }
            } else {
                console.log('❌ Ошибка получения статей:', articlesData.error);
            }
        } else {
            console.log('❌ Ошибка запроса статей');
        }

        // Тест 5: Тестирование аутентификации
        console.log('\n5️⃣ Тестирование аутентификации...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            if (loginData.success) {
                console.log('✅ Аутентификация успешна');
                console.log(`👤 Пользователь: ${loginData.user.username}`);
                console.log(`🔑 Роль: ${loginData.user.role}`);
            } else {
                console.log('❌ Ошибка аутентификации:', loginData.error);
            }
        } else {
            console.log('❌ Ошибка запроса аутентификации');
        }

        console.log('\n🎉 Тестирование завершено!');

    } catch (error) {
        console.error('❌ Ошибка тестирования:', error.message);
        console.log('\n💡 Возможные решения:');
        console.log('1. Убедитесь, что сервер запущен: npm run api-server');
        console.log('2. Проверьте, что порт 3001 открыт');
        console.log('3. Проверьте подключение к базе данных');
    }
}

testAPI(); 