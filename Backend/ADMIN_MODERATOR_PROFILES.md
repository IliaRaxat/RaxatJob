# Решение проблемы с профилями ADMIN и MODERATOR

## Проблема

В системе SmartMatch отсутствовали отдельные профили для ролей `ADMIN` и `MODERATOR`. При смене роли пользователя с `HR` на `ADMIN`, система:

1. ✅ Обновляла роль в таблице `users`
2. ❌ НЕ создавала профиль для админа (его просто не было в схеме)
3. ❌ Старый HR профиль оставался, но становился недоступным

## Решение

### 1. Добавлены новые модели в Prisma Schema

```prisma
// Профиль администратора
model AdminProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  firstName String
  lastName  String
  position  String?  // Должность администратора
  department String? // Отдел
  phone     String?
  avatarId  String?  // ID аватара в MediaFile
  permissions Json?  // Дополнительные права доступа
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Связи
  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  avatar MediaFile? @relation("AdminAvatar", fields: [avatarId], references: [id], onDelete: SetNull)

  @@map("admin_profiles")
}

// Профиль модератора
model ModeratorProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  firstName String
  lastName  String
  position  String?  // Должность модератора
  department String? // Отдел
  phone     String?
  avatarId  String?  // ID аватара в MediaFile
  permissions Json?  // Права модерации
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Связи
  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  avatar MediaFile? @relation("ModeratorAvatar", fields: [avatarId], references: [id], onDelete: SetNull)

  @@map("moderator_profiles")
}
```

### 2. Обновлена модель User

Добавлены связи с новыми профилями:

```prisma
model User {
  // ... существующие поля ...
  
  // Связи
  hrProfile        HRProfile?
  candidateProfile CandidateProfile?
  universityProfile UniversityProfile?
  adminProfile     AdminProfile?        // ← НОВОЕ
  moderatorProfile ModeratorProfile?    // ← НОВОЕ
  // ... остальные связи ...
}
```

### 3. Обновлен AutoProfileService

Добавлена поддержка создания профилей для ролей `ADMIN` и `MODERATOR`:

```typescript
private async createProfileByRole(userId: string, userRole: UserRole): Promise<string> {
  switch (userRole) {
    case 'HR':
      return this.createHRProfile(userId);
    case 'CANDIDATE':
      return this.createCandidateProfile(userId);
    case 'UNIVERSITY':
      return this.createUniversityProfile(userId);
    case 'ADMIN':                    // ← НОВОЕ
      return this.createAdminProfile(userId);
    case 'MODERATOR':                // ← НОВОЕ
      return this.createModeratorProfile(userId);
    default:
      throw new NotFoundException(`Профиль для роли ${userRole} не поддерживается`);
  }
}
```

### 4. Созданы стратегии профилей

- `AdminProfileStrategy` - для работы с профилями администраторов
- `ModeratorProfileStrategy` - для работы с профилями модераторов

### 5. Обновлена логика смены ролей

В `AdminService.updateUserRole()` добавлена автоматическая генерация профилей:

```typescript
async updateUserRole(userId: string, role: any) {
  // Обновляем роль пользователя
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  // Автоматически создаем профиль для новой роли, если его нет
  try {
    await this.autoProfileService.ensureProfileExists(userId, role);
    console.log(`Profile created automatically for user: ${userId}, role: ${role}`);
  } catch (profileError) {
    console.warn(`Failed to create profile for user ${userId}:`, profileError.message);
  }

  return updatedUser;
}
```

## Результат

Теперь при смене роли пользователя:

1. ✅ Роль обновляется в таблице `users`
2. ✅ Автоматически создается соответствующий профиль
3. ✅ Пользователь получает доступ к функциям своей новой роли
4. ✅ Старые профили остаются в базе данных (для истории)

## Тестирование

Для тестирования можно использовать скрипт `test-role-change.js`:

```bash
node test-role-change.js
```

## Миграция базы данных

Для применения изменений к базе данных выполните:

```bash
npx prisma migrate dev --name add_admin_moderator_profiles
```

## API Endpoints

Теперь доступны следующие endpoints для работы с профилями:

- `GET /profiles/admin` - получить профиль администратора
- `PUT /profiles/admin` - обновить профиль администратора
- `GET /profiles/moderator` - получить профиль модератора
- `PUT /profiles/moderator` - обновить профиль модератора

## Структура профилей

### AdminProfile
- `firstName`, `lastName` - имя и фамилия
- `position` - должность администратора
- `department` - отдел
- `phone` - телефон
- `avatarId` - ID аватара
- `permissions` - дополнительные права доступа (JSON)

### ModeratorProfile
- `firstName`, `lastName` - имя и фамилия
- `position` - должность модератора
- `department` - отдел
- `phone` - телефон
- `avatarId` - ID аватара
- `permissions` - права модерации (JSON)
