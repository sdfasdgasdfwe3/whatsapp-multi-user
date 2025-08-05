const db = require('./database');
const bcrypt = require('bcrypt');

async function seedDatabase() {
    console.log('🌱 Начинаем заполнение базы данных тестовыми данными...');
    
    try {
        // Инициализируем подключение к базе данных
        const dbInitialized = await db.initializeDatabase();
        if (!dbInitialized) {
            console.error('❌ Не удалось подключиться к базе данных');
            process.exit(1);
        }
        
        console.log('✅ Подключение к базе данных установлено');
        
        // Создаем тестовых пользователей
        console.log('👥 Создаем тестовых пользователей...');
        
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);
        
        // Создаем администратора
        const adminResult = await db.createUser({
            username: 'admin',
            password: adminPassword,
            fullName: 'Администратор',
            email: 'admin@example.com',
            role: 'admin'
        });
        
        if (adminResult.success) {
            console.log('✅ Администратор создан (ID: ' + adminResult.userId + ')');
        }
        
        // Создаем обычного пользователя
        const userResult = await db.createUser({
            username: 'user',
            password: userPassword,
            fullName: 'Тестовый пользователь',
            email: 'user@example.com',
            role: 'user'
        });
        
        if (userResult.success) {
            console.log('✅ Пользователь создан (ID: ' + userResult.userId + ')');
        }
        
        // Создаем тестовые продукты
        console.log('📦 Создаем тестовые продукты...');
        
        const products = [
            {
                name: 'Ноутбук Dell XPS 13',
                description: 'Мощный ноутбук для работы и творчества с процессором Intel i7',
                price: 89999.00,
                points: 150,
                image: 'https://via.placeholder.com/200x200/667eea/ffffff?text=Ноутбук'
            },
            {
                name: 'iPhone 15 Pro',
                description: 'Смартфон премиум класса с камерой 48 МП',
                price: 129999.00,
                points: 200,
                image: 'https://via.placeholder.com/200x200/764ba2/ffffff?text=iPhone'
            },
            {
                name: 'AirPods Pro',
                description: 'Беспроводные наушники с активным шумоподавлением',
                price: 24999.00,
                points: 50,
                image: 'https://via.placeholder.com/200x200/4CAF50/ffffff?text=Наушники'
            },
            {
                name: 'iPad Pro 12.9"',
                description: 'Мощный планшет для профессионалов с дисплеем Liquid Retina XDR',
                price: 149999.00,
                points: 250,
                image: 'https://via.placeholder.com/200x200/FF6B6B/ffffff?text=Планшет'
            },
            {
                name: 'Apple Watch Series 9',
                description: 'Умные часы с функциями здоровья и фитнеса',
                price: 39999.00,
                points: 80,
                image: 'https://via.placeholder.com/200x200/FFC107/ffffff?text=Часы'
            },
            {
                name: 'Sony A7 IV',
                description: 'Беззеркальная камера с полнокадровым сенсором 33 МП',
                price: 199999.00,
                points: 300,
                image: 'https://via.placeholder.com/200x200/9C27B0/ffffff?text=Камера'
            },
            {
                name: 'Logitech G Pro X',
                description: 'Механическая клавиатура для геймеров с RGB подсветкой',
                price: 12999.00,
                points: 25,
                image: 'https://via.placeholder.com/200x200/607D8B/ffffff?text=Клавиатура'
            },
            {
                name: 'LG 27" 4K Monitor',
                description: 'Монитор 4K с точной цветопередачей для профессионалов',
                price: 45999.00,
                points: 90,
                image: 'https://via.placeholder.com/200x200/795548/ffffff?text=Монитор'
            }
        ];
        
        for (const product of products) {
            const result = await db.createProduct(product);
            if (result.success) {
                console.log('✅ Продукт "' + product.name + '" создан (ID: ' + result.productId + ')');
            } else {
                console.error('❌ Ошибка создания продукта "' + product.name + '":', result.error);
            }
        }
        
        // Создаем тестовые статьи
        console.log('📰 Создаем тестовые статьи...');
        
        const articles = [
            {
                title: 'Новые технологии в 2024 году',
                content: 'Обзор самых важных технологических трендов, которые определят развитие индустрии в 2024 году. От искусственного интеллекта до квантовых вычислений.',
                author: 'Технологический эксперт',
                image: 'https://via.placeholder.com/400x200/667eea/ffffff?text=Технологии'
            },
            {
                title: 'Как выбрать правильный ноутбук',
                content: 'Подробное руководство по выбору ноутбука для работы, учебы и развлечений. Рассматриваем все важные характеристики и критерии выбора.',
                author: 'IT-консультант',
                image: 'https://via.placeholder.com/400x200/764ba2/ffffff?text=Ноутбуки'
            },
            {
                title: 'Безопасность в цифровом мире',
                content: 'Советы по защите персональных данных и обеспечению безопасности в интернете. Современные угрозы и методы защиты.',
                author: 'Специалист по кибербезопасности',
                image: 'https://via.placeholder.com/400x200/4CAF50/ffffff?text=Безопасность'
            },
            {
                title: 'Искусственный интеллект в повседневной жизни',
                content: 'Как ИИ меняет нашу повседневную жизнь. От голосовых помощников до умных домов и автономных автомобилей.',
                author: 'AI-исследователь',
                image: 'https://via.placeholder.com/400x200/FF6B6B/ffffff?text=ИИ'
            },
            {
                title: 'Будущее мобильных устройств',
                content: 'Прогнозы развития мобильных технологий. Что нас ждет в ближайшие годы в мире смартфонов и планшетов.',
                author: 'Мобильный аналитик',
                image: 'https://via.placeholder.com/400x200/FFC107/ffffff?text=Мобильные'
            },
            {
                title: 'Экологичность в технологиях',
                content: 'Как технологические компании работают над снижением экологического воздействия. Зеленые технологии и устойчивое развитие.',
                author: 'Эко-технолог',
                image: 'https://via.placeholder.com/400x200/9C27B0/ffffff?text=Экология'
            },
            {
                title: 'Гейминг в 2024 году',
                content: 'Обзор игровой индустрии и новых технологий в гейминге. VR, AR и облачные игры.',
                author: 'Гейм-журналист',
                image: 'https://via.placeholder.com/400x200/607D8B/ffffff?text=Гейминг'
            },
            {
                title: 'Цифровая трансформация бизнеса',
                content: 'Как компании адаптируются к цифровому миру. Кейсы успешной цифровой трансформации.',
                author: 'Бизнес-консультант',
                image: 'https://via.placeholder.com/400x200/795548/ffffff?text=Бизнес'
            }
        ];
        
        for (const article of articles) {
            const result = await db.createArticle(article);
            if (result.success) {
                console.log('✅ Статья "' + article.title + '" создана (ID: ' + result.articleId + ')');
            } else {
                console.error('❌ Ошибка создания статьи "' + article.title + '":', result.error);
            }
        }
        
        console.log('\n🎉 База данных успешно заполнена тестовыми данными!');
        console.log('\n📋 Данные для входа:');
        console.log('👤 Администратор:');
        console.log('   Логин: admin');
        console.log('   Пароль: admin123');
        console.log('\n👤 Пользователь:');
        console.log('   Логин: user');
        console.log('   Пароль: user123');
        
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error);
        process.exit(1);
    }
}

// Запускаем заполнение базы данных
seedDatabase(); 