/**
 * Отладочный скрипт для проверки статуса отклика
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugApplicationStatus() {
  try {
    console.log('🔍 Отладка статуса отклика...\n');

    // 1. Регистрация кандидата
    console.log('1. Регистрация кандидата...');
    const candidateResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'debug@example.com',
      password: 'password123',
      role: 'CANDIDATE',
      firstName: 'Отладка',
      lastName: 'Тест'
    });
    console.log('✅ Кандидат зарегистрирован:', candidateResponse.data.user.email);

    const token = candidateResponse.data.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Регистрация HR
    console.log('\n2. Регистрация HR...');
    const hrResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'hr-debug@example.com',
      password: 'password123',
      role: 'HR',
      firstName: 'HR',
      lastName: 'Отладка'
    });
    const hrToken = hrResponse.data.access_token;
    const hrHeaders = { Authorization: `Bearer ${hrToken}` };

    // 3. Создание вакансии
    console.log('\n3. Создание вакансии...');
    const jobResponse = await axios.post(`${BASE_URL}/jobs`, {
      title: 'Debug Developer',
      description: 'Отладочная вакансия',
      location: 'Москва',
      type: 'FULL_TIME',
      experienceLevel: 'JUNIOR'
    }, { headers: hrHeaders });
    const jobId = jobResponse.data.id;
    console.log('✅ Вакансия создана:', jobResponse.data.title, 'ID:', jobId);

    // 4. Просмотр деталей вакансии БЕЗ отклика (с токеном)
    console.log('\n4. Просмотр деталей вакансии БЕЗ отклика (с токеном)...');
    const jobDetailsBefore = await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers });
    console.log('📋 Результат:');
    console.log('   - hasApplied:', jobDetailsBefore.data.hasApplied);
    console.log('   - applicationStatus:', jobDetailsBefore.data.applicationStatus);
    console.log('   - applicationId:', jobDetailsBefore.data.applicationId);

    // 5. Создание отклика
    console.log('\n5. Создание отклика...');
    const applicationResponse = await axios.post(`${BASE_URL}/applications`, {
      jobId: jobId,
      coverLetter: 'Отладочный отклик'
    }, { headers });
    console.log('✅ Отклик создан:', applicationResponse.data.id);

    // 6. Просмотр деталей вакансии ПОСЛЕ отклика (с токеном)
    console.log('\n6. Просмотр деталей вакансии ПОСЛЕ отклика (с токеном)...');
    const jobDetailsAfter = await axios.get(`${BASE_URL}/jobs/${jobId}`, { headers });
    console.log('📋 Результат:');
    console.log('   - hasApplied:', jobDetailsAfter.data.hasApplied);
    console.log('   - applicationStatus:', jobDetailsAfter.data.applicationStatus);
    console.log('   - applicationId:', jobDetailsAfter.data.applicationId);
    console.log('   - appliedAt:', jobDetailsAfter.data.appliedAt);

    // 7. Просмотр деталей вакансии БЕЗ токена
    console.log('\n7. Просмотр деталей вакансии БЕЗ токена...');
    const jobDetailsAnonymous = await axios.get(`${BASE_URL}/jobs/${jobId}`);
    console.log('📋 Результат:');
    console.log('   - hasApplied:', jobDetailsAnonymous.data.hasApplied);
    console.log('   - applicationStatus:', jobDetailsAnonymous.data.applicationStatus);

    console.log('\n🔍 Анализ результатов:');
    if (jobDetailsAfter.data.hasApplied) {
      console.log('✅ Статус отклика работает корректно!');
    } else {
      console.log('❌ Проблема: hasApplied = false, хотя отклик существует');
      console.log('🔍 Возможные причины:');
      console.log('   - Пользователь не аутентифицирован');
      console.log('   - Нет профиля кандидата');
      console.log('   - Отклик не найден в базе данных');
      console.log('   - Ошибка в логике поиска откликов');
    }

  } catch (error) {
    console.error('❌ Ошибка при отладке:', error.response?.data || error.message);
  }
}

// Запуск отладки
if (require.main === module) {
  debugApplicationStatus();
}

module.exports = { debugApplicationStatus };
