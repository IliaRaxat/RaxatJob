# Features Layer

## Purpose

The features layer contains user interactions and business features. Each feature is an independent, self-contained module that implements specific business functionality.

## Responsibilities

- User interactions and workflows
- Business logic implementation
- Feature-specific state management
- Feature-specific API calls
- Feature-specific UI components

## What Belongs Here

- **[feature-name]/**: Individual feature slices
  - **ui/**: Feature UI components
  - **model/**: Business logic, state, types, hooks
  - **api/**: Feature-specific API calls
  - **lib/**: Feature helper functions
  - **config/**: Feature configuration
  - **index.ts**: Public API

## Dependency Rules

The features layer can import from:
- entities
- shared

The features layer CANNOT import from:
- app
- processes
- pages
- widgets
- other features (features must be independent!)

## Slice Structure

```
features/
├── authentication/
│   ├── ui/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── model/
│   │   ├── types.ts
│   │   ├── slice.ts          # Redux slice
│   │   ├── hooks.ts
│   │   └── context.tsx
│   ├── api/
│   │   └── authApi.ts
│   └── index.ts
├── job-application/
│   ├── ui/
│   │   ├── ApplicationForm.tsx
│   │   └── ApplicationStatus.tsx
│   ├── model/
│   │   ├── types.ts
│   │   └── hooks.ts
│   ├── api/
│   │   └── applicationApi.ts
│   └── index.ts
└── resume-builder/
    ├── ui/
    │   ├── ResumeEditor.tsx
    │   └── ResumePreview.tsx
    ├── model/
    │   ├── types.ts
    │   └── hooks.ts
    ├── api/
    │   └── resumeApi.ts
    └── index.ts
```

## Examples

```typescript
// features/authentication/model/types.ts
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
```

```typescript
// features/authentication/model/hooks.ts
import { useAppSelector } from '@/shared/lib/redux';

export function useAuth() {
  const auth = useAppSelector(state => state.auth);
  return auth;
}
```

```typescript
// features/authentication/ui/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '../model/hooks';
import { Button } from '@/shared/ui/button';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form implementation */}
    </form>
  );
}
```

```typescript
// features/authentication/index.ts
export { LoginForm, RegisterForm, AuthGuard } from './ui';
export { useAuth, usePermissions } from './model/hooks';
export type { AuthState, LoginCredentials } from './model/types';
```

## Feature Independence

**Critical Rule**: Features MUST NOT import from other features. Each feature should be independent and self-contained.

❌ **Wrong**:
```typescript
// features/job-application/model/hooks.ts
import { useAuth } from '@/features/authentication'; // DON'T DO THIS!
```

✅ **Correct**:
```typescript
// features/job-application/model/hooks.ts
import { useAuth } from '@/shared/lib/auth'; // Use shared abstraction
// OR
import { User } from '@/entities/user'; // Use entity
```

## Guidelines

- Each feature should solve one specific user problem
- Features should be independently testable
- Keep features focused and cohesive
- Use entities for shared domain models
- Use shared layer for common utilities
- Export only what's needed through the public API

## When to Create a Feature

Create a feature when:
- You have a distinct user interaction or workflow
- The functionality is cohesive and focused
- The feature can be independently tested
- The feature implements business logic

Don't create a feature for:
- Simple UI components (use shared/ui)
- Domain models (use entities)
- Utilities (use shared/lib)

## Notes

- Features are the heart of your business logic
- Keep features independent - no feature-to-feature imports
- Use Redux for complex state, React hooks for simple state
- Co-locate tests with the code they test
- CSS modules should be co-located with components
