const axios = require('axios');

// Конфигурация
const BASE_URL = 'http://localhost:3000';
const ADMIN_TOKEN = 'your_admin_jwt_token_here'; // Замените на реальный токен

async function testUsersCountEndpoint() {
  try {
    console.log('🧪 Тестирование эндпоинта GET /admin/users/count');
    console.log('=' .repeat(50));

    // Тест 1: Получить общее количество всех пользователей
    console.log('\n📊 Тест 1: Общее количество пользователей');
    const response1 = await axios.get(`${BASE_URL}/admin/users/count`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ответ:', response1.data);
    console.log('📈 Статус:', response1.status);

    // Тест 2: Получить количество пользователей по роли
    console.log('\n👥 Тест 2: Количество пользователей по роли HR');
    const response2 = await axios.get(`${BASE_URL}/admin/users/count?role=HR`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ответ:', response2.data);
    console.log('📈 Статус:', response2.status);

    // Тест 3: Получить количество активных пользователей
    console.log('\n🟢 Тест 3: Количество активных пользователей');
    const response3 = await axios.get(`${BASE_URL}/admin/users/count?isActive=true`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ответ:', response3.data);
    console.log('📈 Статус:', response3.status);

    // Тест 4: Комбинированные фильтры
    console.log('\n🔍 Тест 4: Комбинированные фильтры (роль + активность)');
    const response4 = await axios.get(`${BASE_URL}/admin/users/count?role=UNIVERSITY&isActive=true`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ответ:', response4.data);
    console.log('📈 Статус:', response4.status);

    console.log('\n🎉 Все тесты завершены успешно!');
    console.log('\n📋 Доступные параметры:');
    console.log('  - role: HR, UNIVERSITY, CANDIDATE, ADMIN, MODERATOR');
    console.log('  - isActive: true/false');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.response?.data || error.message);
    console.error('📊 Статус:', error.response?.status);
    console.error('🔍 Детали:', error.response?.config?.url);
  }
}

// Запуск тестов
if (require.main === module) {
  testUsersCountEndpoint();
}

module.exports = { testUsersCountEndpoint };
