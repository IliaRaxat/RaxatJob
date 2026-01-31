// Скрипт для отладки профиля пользователя
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUserProfile() {
  try {
    console.log('🔍 Отладка профиля пользователя...\n');

    // Получаем всех пользователей с их профилями
    const users = await prisma.user.findMany({
      include: {
        hrProfile: true,
        candidateProfile: true,
        universityProfile: true,
        adminProfile: true,
        moderatorProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`📊 Найдено пользователей: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Пользователь: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Роль: ${user.role}`);
      console.log(`   Активен: ${user.isActive}`);
      console.log(`   Создан: ${user.createdAt}`);
      
      // Проверяем профили
      const profiles = [];
      if (user.hrProfile) profiles.push(`HR (${user.hrProfile.id})`);
      if (user.candidateProfile) profiles.push(`CANDIDATE (${user.candidateProfile.id})`);
      if (user.universityProfile) profiles.push(`UNIVERSITY (${user.universityProfile.id})`);
      if (user.adminProfile) profiles.push(`ADMIN (${user.adminProfile.id})`);
      if (user.moderatorProfile) profiles.push(`MODERATOR (${user.moderatorProfile.id})`);
      
      console.log(`   Профили: ${profiles.length > 0 ? profiles.join(', ') : 'Нет профилей'}`);
      
      // Проверяем соответствие роли и профиля
      const expectedProfile = user.role.toLowerCase() + 'Profile';
      const hasCorrectProfile = user[expectedProfile] !== null;
      
      if (!hasCorrectProfile) {
        console.log(`   ⚠️  ПРОБЛЕМА: Роль ${user.role} не соответствует профилю!`);
      } else {
        console.log(`   ✅ Профиль соответствует роли`);
      }
      
      console.log('');
    });

    // Ищем пользователей с ролью ADMIN
    const adminUsers = users.filter(user => user.role === 'ADMIN');
    console.log(`👑 Пользователи с ролью ADMIN: ${adminUsers.length}`);
    
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.email} (ID: ${admin.id})`);
      if (admin.adminProfile) {
        console.log(`     ✅ Admin профиль: ${admin.adminProfile.id}`);
      } else {
        console.log(`     ❌ Admin профиль отсутствует!`);
      }
    });

    // Ищем пользователей с профилем университета
    const usersWithUniversityProfile = users.filter(user => user.universityProfile);
    console.log(`\n🏫 Пользователи с профилем университета: ${usersWithUniversityProfile.length}`);
    
    usersWithUniversityProfile.forEach(user => {
      console.log(`   - ${user.email} (Роль: ${user.role})`);
      if (user.role !== 'UNIVERSITY') {
        console.log(`     ⚠️  ПРОБЛЕМА: Роль ${user.role} не соответствует профилю университета!`);
      }
    });

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserProfile();
