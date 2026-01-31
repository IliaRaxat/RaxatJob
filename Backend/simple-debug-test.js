/**
 * Простой тест для отладки статуса отклика без внешних зависимостей
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testApplicationStatus() {
  try {
    console.log('🔍 Тестирование статуса отклика...\n');

    // 1. Регистрация кандидата
    console.log('1. Регистрация кандидата...');
    const candidateResponse = await makeRequest('POST', '/auth/register', {}, {
      email: 'test-candidate@example.com',
      password: 'password123',
      role: 'CANDIDATE',
      firstName: 'Тест',
      lastName: 'Кандидат'
    });
    
    if (candidateResponse.status !== 201) {
      console.error('❌ Ошибка регистрации кандидата:', candidateResponse.data);
      return;
    }
    
    const candidateToken = candidateResponse.data.access_token;
    console.log('✅ Кандидат зарегистрирован:', candidateResponse.data.user.email);

    // 2. Регистрация HR
    console.log('\n2. Регистрация HR...');
    const hrResponse = await makeRequest('POST', '/auth/register', {}, {
      email: 'test-hr@example.com',
      password: 'password123',
      role: 'HR',
      firstName: 'HR',
      lastName: 'Менеджер'
    });
    
    if (hrResponse.status !== 201) {
      console.error('❌ Ошибка регистрации HR:', hrResponse.data);
      return;
    }
    
    const hrToken = hrResponse.data.access_token;
    console.log('✅ HR зарегистрирован:', hrResponse.data.user.email);

    // 3. Создание вакансии
    console.log('\n3. Создание вакансии...');
    const jobResponse = await makeRequest('POST', '/jobs', {
      'Authorization': `Bearer ${hrToken}`
    }, {
      title: 'Test Developer',
      description: 'Тестовая вакансия',
      location: 'Москва',
      type: 'FULL_TIME',
      experienceLevel: 'JUNIOR'
    });
    
    if (jobResponse.status !== 201) {
      console.error('❌ Ошибка создания вакансии:', jobResponse.data);
      return;
    }
    
    const jobId = jobResponse.data.id;
    console.log('✅ Вакансия создана:', jobResponse.data.title, 'ID:', jobId);

    // 4. Просмотр деталей вакансии БЕЗ отклика (с токеном)
    console.log('\n4. Просмотр деталей вакансии БЕЗ отклика (с токеном)...');
    const jobDetailsBefore = await makeRequest('GET', `/jobs/${jobId}`, {
      'Authorization': `Bearer ${candidateToken}`
    });
    
    if (jobDetailsBefore.status !== 200) {
      console.error('❌ Ошибка получения деталей вакансии:', jobDetailsBefore.data);
      return;
    }
    
    console.log('📋 Результат БЕЗ отклика:');
    console.log('   - hasApplied:', jobDetailsBefore.data.hasApplied);
    console.log('   - applicationStatus:', jobDetailsBefore.data.applicationStatus);
    console.log('   - applicationId:', jobDetailsBefore.data.applicationId);

    // 5. Создание отклика
    console.log('\n5. Создание отклика...');
    const applicationResponse = await makeRequest('POST', '/applications', {
      'Authorization': `Bearer ${candidateToken}`
    }, {
      jobId: jobId,
      coverLetter: 'Тестовый отклик'
    });
    
    if (applicationResponse.status !== 201) {
      console.error('❌ Ошибка создания отклика:', applicationResponse.data);
      return;
    }
    
    console.log('✅ Отклик создан:', applicationResponse.data.id);

    // 6. Просмотр деталей вакансии ПОСЛЕ отклика (с токеном)
    console.log('\n6. Просмотр деталей вакансии ПОСЛЕ отклика (с токеном)...');
    const jobDetailsAfter = await makeRequest('GET', `/jobs/${jobId}`, {
      'Authorization': `Bearer ${candidateToken}`
    });
    
    if (jobDetailsAfter.status !== 200) {
      console.error('❌ Ошибка получения деталей вакансии:', jobDetailsAfter.data);
      return;
    }
    
    console.log('📋 Результат ПОСЛЕ отклика:');
    console.log('   - hasApplied:', jobDetailsAfter.data.hasApplied);
    console.log('   - applicationStatus:', jobDetailsAfter.data.applicationStatus);
    console.log('   - applicationId:', jobDetailsAfter.data.applicationId);
    console.log('   - appliedAt:', jobDetailsAfter.data.appliedAt);

    // 7. Просмотр деталей вакансии БЕЗ токена
    console.log('\n7. Просмотр деталей вакансии БЕЗ токена...');
    const jobDetailsAnonymous = await makeRequest('GET', `/jobs/${jobId}`);
    
    if (jobDetailsAnonymous.status !== 200) {
      console.error('❌ Ошибка получения деталей вакансии:', jobDetailsAnonymous.data);
      return;
    }
    
    console.log('📋 Результат БЕЗ токена:');
    console.log('   - hasApplied:', jobDetailsAnonymous.data.hasApplied);
    console.log('   - applicationStatus:', jobDetailsAnonymous.data.applicationStatus);

    console.log('\n🔍 Анализ результатов:');
    if (jobDetailsAfter.data.hasApplied) {
      console.log('✅ Статус отклика работает корректно!');
    } else {
      console.log('❌ Проблема: hasApplied = false, хотя отклик существует');
      console.log('🔍 Проверьте логи сервера для отладочной информации');
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запуск теста
if (require.main === module) {
  testApplicationStatus();
}

module.exports = { testApplicationStatus };
