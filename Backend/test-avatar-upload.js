const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Конфигурация
const API_BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@example.com';
const TEST_PASSWORD = 'password123';

async function testAvatarUpload() {
  try {
    console.log('🧪 Тестируем загрузку аватара для администратора...\n');

    // 1. Авторизация
    console.log('1️⃣ Авторизация...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Авторизация успешна');

    // 2. Создаем тестовое изображение
    console.log('\n2️⃣ Создаем тестовое изображение...');
    const testImagePath = path.join(__dirname, 'test-avatar.png');
    
    // Создаем простое PNG изображение 1x1 пиксель
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ]);

    fs.writeFileSync(testImagePath, pngData);
    console.log('✅ Тестовое изображение создано');

    // 3. Загружаем аватар
    console.log('\n3️⃣ Загружаем аватар...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-avatar.png',
      contentType: 'image/png'
    });

    const uploadResponse = await axios.post(
      `${API_BASE_URL}/profiles/avatar/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Аватар загружен успешно!');
    console.log('📊 Результат:', JSON.stringify(uploadResponse.data, null, 2));

    // 4. Получаем профиль для проверки
    console.log('\n4️⃣ Проверяем профиль...');
    const profileResponse = await axios.get(
      `${API_BASE_URL}/profiles`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Профиль получен:');
    console.log('📊 Профиль:', JSON.stringify(profileResponse.data, null, 2));

    // 5. Очистка
    console.log('\n5️⃣ Очистка...');
    fs.unlinkSync(testImagePath);
    console.log('✅ Тестовый файл удален');

    console.log('\n🎉 Тест завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.response?.data || error.message);
    
    // Очистка в случае ошибки
    const testImagePath = path.join(__dirname, 'test-avatar.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

// Запускаем тест
testAvatarUpload();
