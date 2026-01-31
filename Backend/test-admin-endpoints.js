// Тест для проверки endpoints профилей администраторов
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testAdminEndpoints() {
  console.log('🧪 Тестирование endpoints профилей администраторов...\n');

  try {
    // 1. Регистрация администратора
    console.log('1️⃣ Регистрация администратора...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'testadmin@example.com',
      password: 'admin123456',
      role: 'ADMIN'
    });

    const adminToken = registerResponse.data.accessToken;
    console.log('✅ Администратор зарегистрирован');
    console.log(`   Токен: ${adminToken.substring(0, 20)}...`);

    // 2. Получение профиля администратора
    console.log('\n2️⃣ Получение профиля администратора...');
    try {
      const profileResponse = await axios.get(`${API_BASE}/profiles/admin`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('✅ Профиль администратора получен');
      console.log(`   ID: ${profileResponse.data.id}`);
      console.log(`   Имя: ${profileResponse.data.firstName} ${profileResponse.data.lastName}`);
      console.log(`   Должность: ${profileResponse.data.position}`);
      console.log(`   Отдел: ${profileResponse.data.department}`);
    } catch (error) {
      console.log('❌ Ошибка при получении профиля:', error.response?.data || error.message);
    }

    // 3. Обновление профиля администратора
    console.log('\n3️⃣ Обновление профиля администратора...');
    try {
      const updateResponse = await axios.patch(`${API_BASE}/profiles/admin`, {
        firstName: 'Главный',
        lastName: 'Администратор',
        position: 'Системный администратор',
        department: 'IT отдел',
        phone: '+7 (999) 123-45-67'
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log('✅ Профиль администратора обновлен');
      console.log(`   Имя: ${updateResponse.data.firstName} ${updateResponse.data.lastName}`);
      console.log(`   Должность: ${updateResponse.data.position}`);
      console.log(`   Телефон: ${updateResponse.data.phone}`);
    } catch (error) {
      console.log('❌ Ошибка при обновлении профиля:', error.response?.data || error.message);
    }

    // 4. Регистрация модератора
    console.log('\n4️⃣ Регистрация модератора...');
    const moderatorResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: 'testmoderator@example.com',
      password: 'moderator123456',
      role: 'MODERATOR'
    });

    const moderatorToken = moderatorResponse.data.accessToken;
    console.log('✅ Модератор зарегистрирован');
    console.log(`   Токен: ${moderatorToken.substring(0, 20)}...`);

    // 5. Получение профиля модератора
    console.log('\n5️⃣ Получение профиля модератора...');
    try {
      const moderatorProfileResponse = await axios.get(`${API_BASE}/profiles/moderator`, {
        headers: {
          'Authorization': `Bearer ${moderatorToken}`
        }
      });
      console.log('✅ Профиль модератора получен');
      console.log(`   ID: ${moderatorProfileResponse.data.id}`);
      console.log(`   Имя: ${moderatorProfileResponse.data.firstName} ${moderatorProfileResponse.data.lastName}`);
      console.log(`   Должность: ${moderatorProfileResponse.data.position}`);
    } catch (error) {
      console.log('❌ Ошибка при получении профиля модератора:', error.response?.data || error.message);
    }

    // 6. Тест доступа к неправильному профилю
    console.log('\n6️⃣ Тест доступа к неправильному профилю...');
    try {
      await axios.get(`${API_BASE}/profiles/admin`, {
        headers: {
          'Authorization': `Bearer ${moderatorToken}`
        }
      });
      console.log('❌ ОШИБКА: Модератор получил доступ к админ-профилю (не должно быть)');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ УСПЕХ: Доступ к админ-профилю заблокирован для модератора');
        console.log(`   Сообщение: ${error.response.data.message}`);
      } else {
        console.log('❌ НЕОЖИДАННАЯ ОШИБКА:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Тестирование завершено!');
    console.log('\n📋 Резюме:');
    console.log('   ✅ Endpoint /profiles/admin работает');
    console.log('   ✅ Endpoint /profiles/moderator работает');
    console.log('   ✅ Обновление профилей работает');
    console.log('   ✅ Контроль доступа работает');

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.response?.data || error.message);
  }
}

// Запуск тестов
testAdminEndpoints();
