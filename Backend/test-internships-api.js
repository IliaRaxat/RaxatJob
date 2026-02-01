const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/internships',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Статус: ${res.statusCode}`);
  console.log(`Заголовки: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ Успешно получены стажировки:');
      console.log(`Всего стажировок: ${parsed.total}`);
      console.log(`Количество на странице: ${parsed.internships.length}`);
      
      if (parsed.internships.length > 0) {
        console.log('\nПервая стажировка:');
        console.log(`- ID: ${parsed.internships[0].id}`);
        console.log(`- Название: ${parsed.internships[0].title}`);
        console.log(`- Компания: ${parsed.internships[0].hr.company}`);
        console.log(`- Локация: ${parsed.internships[0].location}`);
        console.log(`- Статус: ${parsed.internships[0].status}`);
      }
    } catch (error) {
      console.error('❌ Ошибка парсинга JSON:', error.message);
      console.log('Ответ:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Ошибка запроса:', error.message);
});

req.end();
