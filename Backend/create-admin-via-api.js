const axios = require('axios');

async function createAdmin() {
  try {
    console.log('🔧 Создание администратора через API...');
    
    const response = await axios.post('http://localhost:3000/auth/register', {
      email: 'admin@smartmatch.com',
      password: 'AdminPassword123!',
      role: 'ADMIN'
    });
    
    console.log('✅ Администратор создан успешно!');
    console.log('📧 Email:', response.data.user.email);
    console.log('🔑 Role:', response.data.user.role);
    console.log('🎫 Token:', response.data.accessToken.substring(0, 20) + '...');
    
    console.log('\n🚀 Теперь вы можете войти как администратор:');
    console.log('Email: admin@smartmatch.com');
    console.log('Password: AdminPassword123!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Ошибка API:', error.response.data);
    } else {
      console.error('❌ Ошибка:', error.message);
    }
  }
}

createAdmin();
