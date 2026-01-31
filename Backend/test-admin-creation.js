const http = require('http');

function createAdmin() {
  const postData = JSON.stringify({
    email: 'admin@smartmatch.com',
    password: 'AdminPassword123!',
    role: 'ADMIN'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('✅ Администратор создан успешно!');
        const response = JSON.parse(data);
        console.log('📧 Email:', response.user.email);
        console.log('🔑 Role:', response.user.role);
        console.log('🎫 Token получен!');
      } else {
        console.log('❌ Ошибка при создании администратора');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Проблема с запросом: ${e.message}`);
    console.log('💡 Убедитесь, что сервер запущен на порту 3000');
  });

  req.write(postData);
  req.end();
}

console.log('🔧 Попытка создания администратора через API...');
createAdmin();
