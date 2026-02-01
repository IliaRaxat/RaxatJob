# Entities Layer

## Purpose

The entities layer contains business domain models and entity-specific logic. Entities represent the core concepts of your business domain (User, Job, Resume, Company, etc.).

## Responsibilities

- Domain model definitions (types, interfaces)
- Entity-specific API calls
- Entity-specific UI components
- Entity state management
- Entity validation and business rules

## What Belongs Here

- **[entity-name]/**: Individual entity slices
  - **model/**: Types, interfaces, Redux slices, hooks
  - **api/**: Entity-specific API calls
  - **ui/**: Entity-specific UI components
  - **lib/**: Entity helper functions
  - **index.ts**: Public API

## Dependency Rules

The entities layer can import from:
- shared

The entities layer CANNOT import from:
- app
- processes
- pages
- widgets
- features
- other entities (minimize entity-to-entity dependencies)

## Slice Structure

```
entities/
├── user/
│   ├── model/
│   │   ├── types.ts
│   │   ├── slice.ts          # Redux slice
│   │   └── hooks.ts
│   ├── api/
│   │   └── userApi.ts
│   ├── ui/
│   │   ├── UserCard.tsx
│   │   ├── UserCard.module.css
│   │   └── UserAvatar.tsx
│   └── index.ts
├── job/
│   ├── model/
│   │   ├── types.ts
│   │   └── hooks.ts
│   ├── api/
│   │   └── jobApi.ts
│   ├── ui/
│   │   ├── JobCard.tsx
│   │   └── JobCard.module.css
│   └── index.ts
└── resume/
    ├── model/
    │   ├── types.ts
    │   └── hooks.ts
    ├── api/
    │   └── resumeApi.ts
    ├── ui/
    │   ├── ResumeCard.tsx
    │   └── ResumeCard.module.css
    └── index.ts
```

## Examples

```typescript
// entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  STUDENT = 'student',
  HR = 'hr',
  UNIVERSITY = 'university',
  ADMIN = 'admin'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}
```

```typescript
// entities/user/api/userApi.ts
import { apiClient } from '@/shared/api';
import type { User } from '../model/types';

export async function fetchUser(id: string): Promise<User> {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
}
```

```typescript
// entities/user/ui/UserCard.tsx
import type { User } from '../model/types';
import styles from './UserCard.module.css';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className={styles.card}>
      <img src={user.profile.avatar} alt={user.profile.firstName} />
      <h3>{user.profile.firstName} {user.profile.lastName}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

```typescript
// entities/user/index.ts
export { UserCard, UserAvatar } from './ui';
export { fetchUser, updateUser } from './api/userApi';
export { useUser, useUserPermissions } from './model/hooks';
export type { User, UserRole, UserProfile } from './model/types';
```

## Guidelines

- Entities represent your core business domain
- Keep entities focused on a single domain concept
- Entities should be reusable across features
- Entity UI components should be generic and reusable
- Business rules specific to an entity belong here
- Minimize entity-to-entity dependencies

## Entity vs Feature

**Entity**: Represents a domain concept (User, Job, Resume)
- Focused on data structure and basic operations
- Reusable across multiple features
- No complex business workflows

**Feature**: Implements user interactions (Authentication, Job Application)
- Focused on user workflows and business logic
- Uses entities as building blocks
- Contains complex business processes

## When to Create an Entity

Create an entity when:
- You have a core business domain concept
- The concept is used across multiple features
- You need to centralize the domain model
- The entity has specific API operations

Don't create an entity for:
- Feature-specific types (put in feature/model)
- Temporary UI state (use local state)
- Utility types (use shared/lib/types)

## Notes

- Entities are the foundation of your domain model
- Keep entities independent and reusable
- Entity UI components should be generic
- Use Redux for entity state when needed
- Co-locate tests with the code they test
- CSS modules should be co-located with components
