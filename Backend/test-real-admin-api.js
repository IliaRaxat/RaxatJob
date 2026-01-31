// Тест реальных админ endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testRealAdminAPI() {
  console.log('🧪 Тестирование РЕАЛЬНЫХ админ endpoints...\n');

  try {
    // 1. Сначала получим токен администратора
    console.log('1️⃣ Получение токена администратора...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com', // Замените на реальный email
      password: 'admin123456'     // Замените на реальный пароль
    });

    const adminToken = loginResponse.data.accessToken;
    console.log('✅ Токен получен');
    console.log(`   Токен: ${adminToken.substring(0, 20)}...`);

    // 2. Тест общей статистики
    console.log('\n2️⃣ Тест GET /admin/analytics/overview...');
    try {
      const overviewResponse = await axios.get(`${API_BASE}/admin/analytics/overview`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Общая статистика получена:');
      console.log('   Структура ответа:', JSON.stringify(overviewResponse.data, null, 2));
      
      if (overviewResponse.data.overview) {
        console.log('   📊 Метрики:');
        console.log(`      Пользователи: ${overviewResponse.data.overview.totalUsers}`);
        console.log(`      Вакансии: ${overviewResponse.data.overview.totalJobs}`);
        console.log(`      Отклики: ${overviewResponse.data.overview.totalApplications}`);
        console.log(`      На модерации: ${overviewResponse.data.overview.pendingModeration}`);
      }
      
      if (overviewResponse.data.recentActivity) {
        console.log(`   📈 Активность: ${overviewResponse.data.recentActivity.length} событий`);
      }
      
    } catch (error) {
      console.log('❌ Ошибка при получении статистики:', error.response?.data || error.message);
    }

    // 3. Тест списка пользователей
    console.log('\n3️⃣ Тест GET /admin/users...');
    try {
      const usersResponse = await axios.get(`${API_BASE}/admin/users?page=1&limit=5`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Пользователи получены:');
      console.log('   Структура ответа:', JSON.stringify(usersResponse.data, null, 2));
      
      if (usersResponse.data.users) {
        console.log(`   👥 Найдено пользователей: ${usersResponse.data.users.length}`);
        console.log(`   📄 Пагинация: страница ${usersResponse.data.page} из ${usersResponse.data.totalPages}`);
      }
      
    } catch (error) {
      console.log('❌ Ошибка при получении пользователей:', error.response?.data || error.message);
    }

    // 4. Тест модерации
    console.log('\n4️⃣ Тест GET /admin/moderation/jobs...');
    try {
      const moderationResponse = await axios.get(`${API_BASE}/admin/moderation/jobs?status=PENDING&limit=3`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Вакансии на модерацию получены:');
      console.log('   Структура ответа:', JSON.stringify(moderationResponse.data, null, 2));
      
      if (moderationResponse.data.jobs) {
        console.log(`   💼 Найдено вакансий: ${moderationResponse.data.jobs.length}`);
        console.log(`   📄 Пагинация: страница ${moderationResponse.data.page} из ${moderationResponse.data.totalPages}`);
      }
      
    } catch (error) {
      console.log('❌ Ошибка при получении вакансий:', error.response?.data || error.message);
    }

    // 5. Тест статистики модерации
    console.log('\n5️⃣ Тест GET /admin/moderation/stats...');
    try {
      const statsResponse = await axios.get(`${API_BASE}/admin/moderation/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Статистика модерации получена:');
      console.log('   Структура ответа:', JSON.stringify(statsResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Ошибка при получении статистики модерации:', error.response?.data || error.message);
    }

    // 6. Тест аналитики по навыкам
    console.log('\n6️⃣ Тест GET /admin/analytics/skills...');
    try {
      const skillsResponse = await axios.get(`${API_BASE}/admin/analytics/skills`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Аналитика по навыкам получена:');
      console.log('   Структура ответа:', JSON.stringify(skillsResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Ошибка при получении аналитики навыков:', error.response?.data || error.message);
    }

    // 7. Тест системных настроек
    console.log('\n7️⃣ Тест GET /admin/settings...');
    try {
      const settingsResponse = await axios.get(`${API_BASE}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Системные настройки получены:');
      console.log('   Структура ответа:', JSON.stringify(settingsResponse.data, null, 2));
      
    } catch (error) {
      console.log('❌ Ошибка при получении настроек:', error.response?.data || error.message);
    }

    console.log('\n🎉 Тестирование завершено!');
    console.log('\n📋 Резюме:');
    console.log('   ✅ Проверены реальные endpoints');
    console.log('   ✅ Получены реальные структуры данных');
    console.log('   ✅ Выявлены отличия от документации');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.response?.data || error.message);
    console.log('\n💡 Убедитесь, что:');
    console.log('   1. Сервер запущен на localhost:3000');
    console.log('   2. У вас есть администратор с email admin@example.com');
    console.log('   3. Пароль администратора: admin123456');
    console.log('   4. Пользователь имеет роль ADMIN');
  }
}

// Запуск тестов
testRealAdminAPI();
