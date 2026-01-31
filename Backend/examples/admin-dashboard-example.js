// Пример использования API дашборда администратора
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN'; // Замените на реальный токен

async function adminDashboardExample() {
  console.log('📊 Пример использования API дашборда администратора\n');

  try {
    // 1. Получить общую статистику
    console.log('1️⃣ Получение общей статистики...');
    const overviewResponse = await axios.get(`${API_BASE}/admin/analytics/overview`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    console.log('✅ Общая статистика получена:');
    console.log(`   👥 Всего пользователей: ${overviewResponse.data.totalUsers}`);
    console.log(`   💼 Всего вакансий: ${overviewResponse.data.totalJobs}`);
    console.log(`   📝 Всего откликов: ${overviewResponse.data.totalApplications}`);
    console.log(`   ⏳ На модерации: ${overviewResponse.data.pendingModeration}`);

    // 2. Получить список пользователей
    console.log('\n2️⃣ Получение списка пользователей...');
    const usersResponse = await axios.get(`${API_BASE}/admin/users?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    console.log('✅ Пользователи получены:');
    usersResponse.data.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.isActive ? 'Активен' : 'Неактивен'}`);
    });

    // 3. Получить вакансии на модерацию
    console.log('\n3️⃣ Получение вакансий на модерацию...');
    const moderationResponse = await axios.get(`${API_BASE}/admin/moderation/jobs?status=PENDING&limit=3`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    console.log('✅ Вакансии на модерацию:');
    moderationResponse.data.jobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} - ${job.hr.company}`);
    });

    // 4. Получить статистику модерации
    console.log('\n4️⃣ Получение статистики модерации...');
    const moderationStatsResponse = await axios.get(`${API_BASE}/admin/moderation/stats`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    console.log('✅ Статистика модерации:');
    console.log(`   ⏳ Ожидают: ${moderationStatsResponse.data.totalPending}`);
    console.log(`   ✅ Одобрено: ${moderationStatsResponse.data.totalApproved}`);
    console.log(`   ❌ Отклонено: ${moderationStatsResponse.data.totalRejected}`);

    // 5. Получить аналитику по навыкам
    console.log('\n5️⃣ Получение аналитики по навыкам...');
    const skillsResponse = await axios.get(`${API_BASE}/admin/analytics/skills`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    console.log('✅ Топ навыков:');
    skillsResponse.data.mostPopularSkills.slice(0, 3).forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.name} - ${skill.count} раз`);
    });

    // 6. Получить аналитику по компаниям
    console.log('\n6️⃣ Получение аналитики по компаниям...');
    const companiesResponse = await axios.get(`${API_BASE}/admin/analytics/companies`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    console.log('✅ Статистика компаний:');
    console.log(`   🏢 Всего компаний: ${companiesResponse.data.totalCompanies}`);
    console.log(`   ✅ Активных: ${companiesResponse.data.activeCompanies}`);

    // 7. Получить системные настройки
    console.log('\n7️⃣ Получение системных настроек...');
    const settingsResponse = await axios.get(`${API_BASE}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    
    console.log('✅ Системные настройки:');
    settingsResponse.data.settings.forEach(setting => {
      console.log(`   ${setting.key}: ${setting.value}`);
    });

    console.log('\n🎉 Все данные дашборда получены успешно!');
    console.log('\n📋 Резюме:');
    console.log('   ✅ Общая статистика загружена');
    console.log('   ✅ Список пользователей получен');
    console.log('   ✅ Вакансии на модерацию загружены');
    console.log('   ✅ Статистика модерации получена');
    console.log('   ✅ Аналитика по навыкам загружена');
    console.log('   ✅ Аналитика по компаниям получена');
    console.log('   ✅ Системные настройки загружены');

  } catch (error) {
    console.error('❌ Ошибка:', error.response?.data || error.message);
    console.log('\n💡 Убедитесь, что:');
    console.log('   1. Сервер запущен на localhost:3000');
    console.log('   2. У вас есть валидный JWT токен администратора');
    console.log('   3. Пользователь имеет роль ADMIN');
  }
}

// Запуск примера
adminDashboardExample();
