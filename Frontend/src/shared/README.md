# Shared Layer

## Purpose

The shared layer contains reusable code that can be used across all other layers. This includes UI components, utilities, API configuration, and application constants.

## Responsibilities

- Reusable UI components (buttons, inputs, modals)
- API client configuration
- Utility functions and helpers
- Application configuration and constants
- Common types and interfaces
- Testing utilities

## What Belongs Here

- **ui/**: Reusable UI components (design system)
- **api/**: API client configuration and base functions
- **lib/**: Utility functions, helpers, hooks
- **config/**: Application configuration and constants

## Dependency Rules

The shared layer CANNOT import from any other layer:
- ❌ app
- ❌ processes
- ❌ pages
- ❌ widgets
- ❌ features
- ❌ entities

The shared layer can only import from:
- External libraries (npm packages)
- Other shared slices

## Slice Structure

```
shared/
├── ui/
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── index.ts
│   ├── input/
│   │   ├── Input.tsx
│   │   ├── Input.module.css
│   │   └── index.ts
│   ├── modal/
│   │   ├── Modal.tsx
│   │   ├── Modal.module.css
│   │   └── index.ts
│   └── index.ts
├── api/
│   ├── client.ts
│   ├── interceptors.ts
│   ├── types.ts
│   └── index.ts
├── lib/
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── string.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── types/
│   │   └── common.ts
│   └── index.ts
└── config/
    ├── constants.ts
    ├── env.ts
    └── index.ts
```

## Examples

### Shared UI Component

```typescript
// shared/ui/button/Button.tsx
import { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export function Button({ 
  variant = 'primary', 
  size = 'medium',
  children,
  className,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

```typescript
// shared/ui/button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### API Client

```typescript
// shared/api/client.ts
import axios from 'axios';
import { API_BASE_URL } from '@/shared/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

```typescript
// shared/api/types.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
```

```typescript
// shared/api/index.ts
export { apiClient } from './client';
export type { ApiResponse, PaginatedResponse, ApiError } from './types';
```

### Utility Functions

```typescript
// shared/lib/utils/date.ts
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isDateInPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}
```

```typescript
// shared/lib/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Configuration

```typescript
// shared/config/env.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Job Portal';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
```

```typescript
// shared/config/constants.ts
export const USER_ROLES = {
  STUDENT: 'student',
  HR: 'hr',
  UNIVERSITY: 'university',
  ADMIN: 'admin',
} as const;

export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
```

## Guidelines

- Keep shared code truly generic and reusable
- No business logic in shared layer
- No domain-specific code
- Document all shared components and utilities
- Maintain a consistent API across shared modules
- Use TypeScript for type safety

## What Belongs in Shared

✅ **Should be in shared**:
- Generic UI components (Button, Input, Modal)
- Utility functions (date formatting, string manipulation)
- API client configuration
- Common types (ApiResponse, PaginatedResponse)
- Application constants
- Custom hooks (useDebounce, useLocalStorage)

❌ **Should NOT be in shared**:
- Business logic
- Domain-specific components
- Feature-specific utilities
- Entity-specific types
- Feature state management

## Notes

- Shared is the foundation - keep it stable
- Changes to shared affect all layers
- Keep shared modules small and focused
- Document thoroughly - shared code is used everywhere
- Test shared code extensively
- Avoid adding dependencies to shared unless necessary
