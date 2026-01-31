const Minio = require('minio');

async function testMinioConnection() {
  console.log('🔍 Тестируем подключение к MinIO...\n');

  const minioClient = new Minio.Client({
    endPoint: 'storage.vchugaev.ru',
    port: 443,
    useSSL: true,
    accessKey: 'adminuser',
    secretKey: 'strongpassword'
  });

  try {
    // Проверяем подключение
    console.log('1️⃣ Проверяем подключение к MinIO...');
    const bucketName = 'smartmatch';
    
    const exists = await minioClient.bucketExists(bucketName);
    console.log(`✅ Bucket '${bucketName}' существует:`, exists);

    if (!exists) {
      console.log('📦 Создаем bucket...');
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log('✅ Bucket создан успешно');
    }

    // Тестируем загрузку файла
    console.log('\n2️⃣ Тестируем загрузку файла...');
    const testData = Buffer.from('Hello MinIO!', 'utf8');
    const fileName = 'test-connection.txt';

    await minioClient.putObject(bucketName, fileName, testData, testData.length, {
      'Content-Type': 'text/plain'
    });
    console.log('✅ Файл загружен успешно');

    // Тестируем получение presigned URL
    console.log('\n3️⃣ Тестируем presigned URL...');
    const presignedUrl = await minioClient.presignedGetObject(bucketName, fileName, 3600);
    console.log('✅ Presigned URL создан:', presignedUrl);

    // Очистка
    console.log('\n4️⃣ Очистка...');
    await minioClient.removeObject(bucketName, fileName);
    console.log('✅ Тестовый файл удален');

    console.log('\n🎉 MinIO подключение работает корректно!');

  } catch (error) {
    console.error('❌ Ошибка подключения к MinIO:', error.message);
    console.error('   Детали:', error);
  }
}

testMinioConnection();
