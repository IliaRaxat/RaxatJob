const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'AdminPassword123!';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  console.log('🔑 Оригинальный пароль:', password);
  console.log('🔐 Хешированный пароль:', hashedPassword);
  
  console.log('\n📝 SQL запрос для создания администратора:');
  console.log(`
INSERT INTO users (id, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin_' || substr(md5(random()::text), 1, 25),
  'admin@smartmatch.com',
  '${hashedPassword}',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
  `);
}

hashPassword();
