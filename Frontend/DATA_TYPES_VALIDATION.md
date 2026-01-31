# 🔧 Валидация типов данных в резюме

## ❌ Проблемы с типами данных

### Навыки (Skills)
```typescript
// ❌ Неправильно
{
  "name": "JavaScript",
  "level": "3",        // Строка вместо числа
  "category": "Programming"
}

// ✅ Правильно
{
  "name": "JavaScript", 
  "level": 3,          // Число от 1 до 5
  "category": "Programming"
}
```

### Языки (Languages)
```typescript
// ❌ Неправильно
{
  "name": "English",
  "level": "Носитель"  // Русское значение
}

// ✅ Правильно
{
  "name": "English",
  "level": "Native"    // Стандартное английское значение
}
```

## ✅ Решение

### 1. **Строгая типизация**

```typescript
// Навыки - level как число
export interface ResumeSkill {
  name: string;
  level: number; // 1-5
  category?: string;
}

// Языки - level как строка из допустимых значений
export interface ResumeLanguage {
  name: string;
  level: 'Basic' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced' | 'Fluent' | 'Native';
  certification?: string;
}
```

### 2. **Валидация в редакторе**

#### Навыки - преобразование в число
```typescript
const updateSkill = (index: number, field: keyof ResumeSkill, value: any) => {
  // Убеждаемся, что level всегда является числом
  const processedValue = field === 'level' ? parseInt(value) || 1 : value;
  
  setFormData(prev => ({
    ...prev,
    skills: prev.skills?.map((skill, i) => 
      i === index ? { ...skill, [field]: processedValue } : skill
    ) || []
  }));
};
```

#### Языки - валидация строковых значений
```typescript
const updateLanguage = (index: number, field: keyof ResumeLanguage, value: any) => {
  // Убеждаемся, что level всегда является строкой из допустимых значений
  const validLevels = ['Basic', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent', 'Native'];
  const processedValue = field === 'level' && validLevels.includes(value) ? value : 
                        field === 'level' ? 'Basic' : value;
  
  setFormData(prev => ({
    ...prev,
    languages: prev.languages?.map((lang, i) => 
      i === index ? { ...lang, [field]: processedValue } : lang
    ) || []
  }));
};
```

### 3. **Валидация перед сохранением**

```typescript
const handleSave = async () => {
  // Проверяем валидность уровней навыков
  const hasInvalidSkills = (formData.skills || []).some(skill => 
    typeof skill.level !== 'number' || skill.level < 1 || skill.level > 5
  );

  // Проверяем валидность уровней языков
  const validLanguageLevels = ['Basic', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent', 'Native'];
  const hasInvalidLanguages = (formData.languages || []).some(lang => 
    !validLanguageLevels.includes(lang.level)
  );

  if (hasInvalidSkills) {
    alert('Пожалуйста, исправьте некорректные уровни навыков (должны быть от 1 до 5)');
    return;
  }

  if (hasInvalidLanguages) {
    alert('Пожалуйста, исправьте некорректные уровни языков');
    return;
  }

  // Отправляем данные...
};
```

### 4. **UI компоненты**

#### Селект для навыков (число)
```jsx
<select
  value={skill.level}
  onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
  className={styles.select}
>
  <option value={1}>1 - Новичок</option>
  <option value={2}>2 - Начальный</option>
  <option value={3}>3 - Средний</option>
  <option value={4}>4 - Продвинутый</option>
  <option value={5}>5 - Эксперт</option>
</select>
```

#### Селект для языков (строка)
```jsx
<select
  value={language.level}
  onChange={(e) => updateLanguage(index, 'level', e.target.value)}
  className={styles.select}
>
  <option value="">Выберите уровень</option>
  <option value="Basic">Basic</option>
  <option value="Elementary">Elementary</option>
  <option value="Intermediate">Intermediate</option>
  <option value="Upper-Intermediate">Upper-Intermediate</option>
  <option value="Advanced">Advanced</option>
  <option value="Fluent">Fluent</option>
  <option value="Native">Native</option>
</select>
```

## 🎯 Правильные типы данных

### **Навыки (Skills)**
```typescript
{
  name: string;           // "JavaScript"
  level: number;          // 1, 2, 3, 4, 5
  category?: string;      // "Programming"
}
```

### **Языки (Languages)**
```typescript
{
  name: string;           // "English"
  level: string;          // "Native", "Fluent", "Advanced", etc.
  certification?: string; // "IELTS 7.5"
}
```

## 🔍 Валидация на разных уровнях

### 1. **TypeScript типы** - компиляция
```typescript
// Ошибка компиляции, если неправильный тип
const skill: ResumeSkill = {
  name: "JavaScript",
  level: "3", // ❌ Type error: string is not assignable to number
  category: "Programming"
};
```

### 2. **Runtime валидация** - выполнение
```typescript
// Проверка во время выполнения
if (typeof skill.level !== 'number') {
  throw new Error('Skill level must be a number');
}
```

### 3. **UI валидация** - пользователь
```typescript
// Визуальная обратная связь
{skill.level && (typeof skill.level !== 'number' || skill.level < 1 || skill.level > 5) && (
  <span className={styles.errorText}>Уровень должен быть от 1 до 5</span>
)}
```

## 🚀 Преимущества

1. **Типобезопасность** - предотвращение ошибок на этапе компиляции
2. **Валидация данных** - проверка корректности во время выполнения
3. **UX** - понятные сообщения об ошибках для пользователей
4. **API совместимость** - правильные типы для сервера
5. **Отладка** - легче найти проблемы с типами данных

## 📝 Рекомендации

1. **Всегда используйте строгую типизацию** TypeScript
2. **Валидируйте данные на клиенте** перед отправкой
3. **Проверяйте типы** в runtime для критических данных
4. **Показывайте ошибки** пользователю понятным языком
5. **Документируйте ожидаемые типы** в API
