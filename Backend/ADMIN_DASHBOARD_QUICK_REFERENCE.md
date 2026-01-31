# 🚀 Быстрая справка по дашборду администратора

## 🔑 Основные endpoints

### 📊 Статистика
- `GET /admin/analytics/overview` - Общая статистика
- `GET /admin/analytics/users` - Статистика пользователей
- `GET /admin/analytics/jobs` - Статистика вакансий
- `GET /admin/analytics/applications` - Статистика откликов
- `GET /admin/analytics/companies` - Статистика компаний
- `GET /admin/analytics/universities` - Статистика университетов
- `GET /admin/analytics/skills` - Статистика навыков
- `GET /admin/analytics/activity` - Активность системы

### 👥 Управление пользователями
- `GET /admin/users` - Список пользователей
- `PATCH /admin/users/{id}/role` - Изменить роль
- `PATCH /admin/users/{id}/activate` - Активировать
- `PATCH /admin/users/{id}/deactivate` - Деактивировать

### 🔍 Модерация
- `GET /admin/moderation/jobs` - Вакансии на модерацию
- `PATCH /admin/moderation/jobs/{id}/approve` - Одобрить
- `PATCH /admin/moderation/jobs/{id}/reject` - Отклонить
- `GET /admin/moderation/stats` - Статистика модерации
- `PATCH /admin/moderation/bulk-approve` - Массовое одобрение
- `PATCH /admin/moderation/bulk-reject` - Массовое отклонение

### ⚙️ Настройки
- `GET /admin/settings` - Системные настройки
- `PATCH /admin/settings` - Обновить настройки

## 📱 Рекомендуемый интерфейс

### Главная страница дашборда:
```javascript
// 1. Загрузить общую статистику
const overview = await fetch('/admin/analytics/overview');

// 2. Показать карточки с метриками
const metrics = {
  totalUsers: overview.totalUsers,
  totalJobs: overview.totalJobs,
  pendingModeration: overview.pendingModeration,
  newUsersToday: overview.newUsersToday
};

// 3. Показать графики роста
const charts = {
  userGrowth: overview.userGrowth,
  jobGrowth: overview.jobGrowth
};

// 4. Показать последнюю активность
const activity = overview.recentActivity;
```

### Раздел "Пользователи":
```javascript
// Загрузить список пользователей
const users = await fetch('/admin/users?page=1&limit=20');

// Фильтры
const filters = {
  role: 'HR',           // HR, CANDIDATE, UNIVERSITY, ADMIN, MODERATOR
  isActive: true,       // true, false
  search: 'email@example.com'
};
```

### Раздел "Модерация":
```javascript
// Загрузить вакансии на модерацию
const jobs = await fetch('/admin/moderation/jobs?status=PENDING');

// Одобрить вакансию
await fetch(`/admin/moderation/jobs/${jobId}/approve`, {
  method: 'PATCH',
  body: JSON.stringify({ comment: 'Одобрено' })
});

// Отклонить вакансию
await fetch(`/admin/moderation/jobs/${jobId}/reject`, {
  method: 'PATCH',
  body: JSON.stringify({ comment: 'Не соответствует требованиям' })
});
```

## 🎯 Ключевые метрики для отображения

### Карточки на главной:
1. **👥 Пользователи** - `totalUsers` (всего) + `newUsersToday` (сегодня)
2. **💼 Вакансии** - `totalJobs` (всего) + `activeJobs` (активных)
3. **📝 Отклики** - `totalApplications` (всего) + `newApplicationsToday` (сегодня)
4. **⏳ Модерация** - `pendingModeration` (ожидают)

### Графики:
1. **Рост пользователей** - `userGrowth.thisWeek` vs `userGrowth.lastWeek`
2. **Рост вакансий** - `jobGrowth.thisWeek` vs `jobGrowth.lastWeek`
3. **Топ навыков** - `topSkills` (массив с name и count)

### Таблицы:
1. **Последние пользователи** - `/admin/users?limit=10`
2. **Вакансии на модерацию** - `/admin/moderation/jobs?status=PENDING`
3. **Последняя активность** - `recentActivity` из overview

## 🔧 Примеры запросов

### Получить все данные для дашборда:
```bash
# Общая статистика
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/admin/analytics/overview

# Пользователи
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/admin/users?page=1&limit=20

# Модерация
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/admin/moderation/jobs?status=PENDING

# Статистика модерации
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/admin/moderation/stats
```

### Изменить роль пользователя:
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "MODERATOR"}' \
  http://localhost:3000/admin/users/user_id/role
```

### Одобрить вакансию:
```bash
curl -X PATCH \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Одобрено"}' \
  http://localhost:3000/admin/moderation/jobs/job_id/approve
```

## 🚨 Важные замечания

1. **Все endpoints требуют роль ADMIN**
2. **JWT токен обязателен** в заголовке Authorization
3. **Пагинация** - используйте параметры `page` и `limit`
4. **Фильтрация** - доступны параметры `role`, `isActive`, `search`
5. **Даты** - используйте формат `YYYY-MM-DD` для `startDate` и `endDate`

## 📊 Рекомендуемые компоненты UI

1. **Dashboard Cards** - метрики в карточках
2. **Charts** - графики роста (Line charts)
3. **Tables** - списки пользователей/вакансий
4. **Modals** - для одобрения/отклонения вакансий
5. **Filters** - для фильтрации данных
6. **Pagination** - для навигации по страницам

**Замените `ADMIN_TOKEN` на ваш JWT токен администратора!** 🚀
