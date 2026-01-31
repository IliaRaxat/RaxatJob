const axios = require('axios');

async function testAvatarUpload() {
  try {
    console.log('🧪 Тестируем загрузку аватара...\n');

    // 1. Проверяем доступность API
    console.log('1️⃣ Проверяем доступность API...');
    try {
      const healthResponse = await axios.get('http://localhost:3000');
      console.log('✅ API доступен');
    } catch (error) {
      console.log('❌ API недоступен:', error.message);
      return;
    }

    // 2. Авторизация
    console.log('\n2️⃣ Авторизация...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Авторизация успешна');

    // 3. Создаем тестовое изображение
    console.log('\n3️⃣ Создаем тестовое изображение...');
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');

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

    const testImagePath = path.join(__dirname, 'test-avatar.png');
    fs.writeFileSync(testImagePath, pngData);
    console.log('✅ Тестовое изображение создано');

    // 4. Загружаем аватар
    console.log('\n4️⃣ Загружаем аватар...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-avatar.png',
      contentType: 'image/png'
    });

    try {
      const uploadResponse = await axios.post(
        'http://localhost:3000/profiles/avatar/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000 // 30 секунд таймаут
        }
      );

      console.log('✅ Аватар загружен успешно!');
      console.log('📊 Результат:', JSON.stringify(uploadResponse.data, null, 2));
    } catch (uploadError) {
      console.log('❌ Ошибка при загрузке аватара:');
      console.log('   Статус:', uploadError.response?.status);
      console.log('   Данные:', uploadError.response?.data);
      console.log('   Сообщение:', uploadError.message);
    }

    // 5. Очистка
    console.log('\n5️⃣ Очистка...');
    fs.unlinkSync(testImagePath);
    console.log('✅ Тестовый файл удален');

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
  }
}

testAvatarUpload();
