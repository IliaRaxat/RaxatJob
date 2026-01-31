// Пример использования API для работы с администраторами
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function adminApiExample() {
  console.log('🔧 Пример работы с администраторами через API\n');

  try {
    // 1. Регистрация администратора
    console.log('1️⃣ Регистрация администратора...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'admin@example.com',
      password: 'admin123456',
      role: 'ADMIN'
    });

    console.log('✅ Администратор зарегистрирован');
    console.log(`   Email: ${registerResponse.data.user.email}`);
    console.log(`   Роль: ${registerResponse.data.user.role}`);
    console.log(`   Токен: ${registerResponse.data.accessToken.substring(0, 20)}...`);

    const adminToken = registerResponse.data.accessToken;

    // 2. Авторизация администратора
    console.log('\n2️⃣ Авторизация администратора...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123456'
    });

    console.log('✅ Администратор авторизован');
    console.log(`   Токен: ${loginResponse.data.accessToken.substring(0, 20)}...`);

    // 3. Использование админ-функций (пример)
    console.log('\n3️⃣ Использование админ-функций...');
    try {
      const usersResponse = await axios.get(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('✅ Получен список пользователей');
      console.log(`   Количество пользователей: ${usersResponse.data.length}`);
    } catch (error) {
      console.log('ℹ️  Админ-функции могут быть недоступны:', error.response?.data?.message || error.message);
    }

    // 4. Регистрация модератора
    console.log('\n4️⃣ Регистрация модератора...');
    const moderatorResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'moderator@example.com',
      password: 'moderator123456',
      role: 'MODERATOR'
    });

    console.log('✅ Модератор зарегистрирован');
    console.log(`   Email: ${moderatorResponse.data.user.email}`);
    console.log(`   Роль: ${moderatorResponse.data.user.role}`);

    // 5. Авторизация модератора
    console.log('\n5️⃣ Авторизация модератора...');
    const moderatorLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'moderator@example.com',
      password: 'moderator123456'
    });

    console.log('✅ Модератор авторизован');
    console.log(`   Токен: ${moderatorLoginResponse.data.accessToken.substring(0, 20)}...`);

    console.log('\n🎉 Все операции выполнены успешно!');
    console.log('\n📋 Резюме:');
    console.log('   ✅ Администратор может регистрироваться через API');
    console.log('   ✅ Администратор может авторизоваться через API');
    console.log('   ✅ Модератор может регистрироваться через API');
    console.log('   ✅ Модератор может авторизоваться через API');
    console.log('   ✅ Все роли поддерживают стандартный API');

  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
  }
}

// Запуск примера
adminApiExample();
