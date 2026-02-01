# 🚀 Быстрый деплой RaxatJob

## Для завтрашней презентации - самый быстрый способ!

### Вариант 1: Docker (Рекомендуется) ⭐

**Требования:**
- Docker Desktop установлен и запущен
- 5-10 минут времени

**Шаги:**

1. **Создайте .env файл:**
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

2. **Отредактируйте .env** (минимальные изменения):
```env
POSTGRES_PASSWORD=mypassword123
JWT_SECRET=my-super-secret-jwt-key-for-production-min-32-chars
SESSION_SECRET=my-session-secret-key-for-production-32
ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

3. **Запустите деплой скрипт:**
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

4. **Выберите вариант 2 (Production)**

5. **Готово!** 🎉
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

**Тестовые пользователи:**
- HR: `hr@example.com` / `password123`
- Кандидат: `candidate@example.com` / `password123`
- Админ: `admin@example.com` / `admin123`

---

### Вариант 2: Ручной запуск (без Docker)

**Требования:**
- Node.js 18+
- PostgreSQL 14+

**Шаги:**

1. **Запустите PostgreSQL:**
```bash
# Через Docker
docker-compose up -d postgres

# Или используйте локальный PostgreSQL
```

2. **Backend:**
```bash
cd Backend

# Установите зависимости
npm install

# Настройте .env (используйте Backend/.env как пример)

# Примените миграции
npx prisma migrate deploy
npx prisma generate

# Заполните тестовыми данными
node seed-sample-data.js

# Соберите проект
npm run build

# Запустите
npm run start:prod
```

3. **Frontend (в новом терминале):**
```bash
cd Frontend

# Установите зависимости
npm install

# Настройте .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:3001" > .env.local

# Соберите проект
npm run build

# Запустите
npm start
```

4. **Готово!** 🎉
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

---

## 🔧 Полезные команды

### Docker

```bash
# Просмотр логов
docker-compose logs -f

# Просмотр логов только backend
docker-compose logs -f backend

# Просмотр логов только frontend
docker-compose logs -f frontend

# Остановить все сервисы
docker-compose down

# Остановить и удалить данные
docker-compose down -v

# Перезапустить сервис
docker-compose restart backend
docker-compose restart frontend

# Пересобрать и запустить
docker-compose up -d --build
```

### Проверка работоспособности

```bash
# Проверить backend
curl http://localhost:3001/health

# Проверить frontend
curl http://localhost:3000
```

---

## 🐛 Решение проблем

### Backend не запускается

1. **Проверьте логи:**
```bash
docker-compose logs backend
```

2. **Проверьте подключение к БД:**
```bash
docker-compose exec postgres psql -U postgres -d raxatjob -c "SELECT 1;"
```

3. **Пересоздайте контейнер:**
```bash
docker-compose down
docker-compose up -d --build
```

### Frontend не подключается к Backend

1. **Проверьте NEXT_PUBLIC_BACKEND_URL в .env**
2. **Проверьте ALLOWED_ORIGINS в Backend/.env**
3. **Убедитесь, что backend запущен:**
```bash
curl http://localhost:3001/health
```

### База данных не инициализируется

1. **Удалите volume и пересоздайте:**
```bash
docker-compose down -v
docker-compose up -d
```

2. **Примените миграции вручную:**
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Порты заняты

Если порты 3000 или 3001 заняты, измените их в docker-compose.yml:
```yaml
services:
  backend:
    ports:
      - "3002:3001"  # Изменить первое число
  
  frontend:
    ports:
      - "3001:3000"  # Изменить первое число
```

---

## 📊 Мониторинг

### Проверка статуса сервисов
```bash
docker-compose ps
```

### Использование ресурсов
```bash
docker stats
```

### Проверка здоровья БД
```bash
docker-compose exec postgres pg_isready -U postgres
```

---

## 🔒 Безопасность для продакшена

Перед деплоем на реальный сервер:

1. ✅ Измените все пароли и секреты в .env
2. ✅ Используйте сильные пароли (минимум 32 символа)
3. ✅ Добавьте свой домен в ALLOWED_ORIGINS
4. ✅ Настройте HTTPS (SSL сертификаты)
5. ✅ Настройте firewall
6. ✅ Регулярно делайте бэкапы БД

---

## 📞 Поддержка

Если что-то не работает:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Проверьте .env файлы
4. Перезапустите: `docker-compose restart`

---

## 🎯 Для презентации завтра

**Минимальный чеклист:**

- [ ] Docker Desktop запущен
- [ ] Создан и настроен .env файл
- [ ] Запущен deploy.bat (Windows) или deploy.sh (Linux/Mac)
- [ ] Выбран вариант 2 (Production)
- [ ] Заполнена БД тестовыми данными (seed)
- [ ] Frontend открывается на http://localhost:3000
- [ ] Backend отвечает на http://localhost:3001
- [ ] Можете войти как HR (hr@example.com / password123)
- [ ] Можете войти как Кандидат (candidate@example.com / password123)

**Время деплоя: ~5-10 минут** ⏱️

Удачи с презентацией! 🚀
