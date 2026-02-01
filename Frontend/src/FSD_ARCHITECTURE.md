# Feature-Sliced Design (FSD) Architecture

## Overview

This project follows the Feature-Sliced Design (FSD) architectural methodology. FSD organizes code into layers with strict dependency rules, promoting maintainability, scalability, and clear separation of concerns.

## Table of Contents

1. [Layer Hierarchy](#layer-hierarchy)
2. [Dependency Rules](#dependency-rules)
3. [Slice Structure](#slice-structure)
4. [Public API Pattern](#public-api-pattern)
5. [Creating New Slices](#creating-new-slices)
6. [Import Guidelines](#import-guidelines)
7. [Common Patterns](#common-patterns)
8. [Migration Guide](#migration-guide)

## Layer Hierarchy

FSD consists of seven layers, ordered from highest to lowest:

```
┌─────────────────────────────────────┐
│  1. app        (Application)        │  ← Highest layer
├─────────────────────────────────────┤
│  2. processes  (Business Processes) │
├─────────────────────────────────────┤
│  3. pages      (Route Pages)        │
├─────────────────────────────────────┤
│  4. widgets    (Composite UI)       │
├─────────────────────────────────────┤
│  5. features   (User Interactions)  │
├─────────────────────────────────────┤
│  6. entities   (Business Entities)  │
├─────────────────────────────────────┤
│  7. shared     (Reusable Code)      │  ← Lowest layer
└─────────────────────────────────────┘
```

### Layer Descriptions

| Layer | Purpose | Examples |
|-------|---------|----------|
| **app** | Application initialization, global providers, routing | Redux store, AuthProvider, root layout |
| **processes** | Complex inter-feature workflows (optional) | Multi-step onboarding, checkout flow |
| **pages** | Next.js route pages, composition | /jobs, /profile, /admin |
| **widgets** | Large composite UI blocks | Dashboard, StudentCard, HRPanel |
| **features** | User interactions, business logic | Authentication, JobApplication, ResumeBuilder |
| **entities** | Business domain models | User, Job, Resume, Company |
| **shared** | Reusable utilities, UI kit | Button, Input, API client, utils |

## Dependency Rules

**Golden Rule**: Each layer can only import from layers **below** it in the hierarchy.

```
app        → processes, pages, widgets, features, entities, shared
processes  → pages, widgets, features, entities, shared
pages      → widgets, features, entities, shared
widgets    → features, entities, shared
features   → entities, shared
entities   → shared
shared     → (external libraries only)
```

### Critical Rules

1. **Shared layer** cannot import from any other layer
2. **Entities layer** can only import from shared
3. **Features** cannot import from other features (must be independent!)
4. **Pages** cannot import from app or processes
5. **Widgets** cannot import from pages, processes, or app

## Slice Structure

Each slice follows a consistent internal structure:

```
[layer]/
└── [slice-name]/
    ├── ui/                     # UI components
    │   ├── Component.tsx
    │   └── Component.module.css
    ├── api/                    # API functions
    │   └── api.ts
    ├── model/                  # Business logic, types, state
    │   ├── types.ts
    │   ├── slice.ts            # Redux slice (if needed)
    │   └── hooks.ts
    ├── lib/                    # Helper functions
    │   └── utils.ts
    ├── config/                 # Configuration
    │   └── constants.ts
    └── index.ts                # Public API ⭐
```

### Segments

- **ui/**: React components and their styles
- **api/**: API calls and data fetching
- **model/**: Types, business logic, state management, hooks
- **lib/**: Helper functions and utilities
- **config/**: Configuration and constants

Not all segments are required - use only what you need!

## Public API Pattern

Each slice **must** export its public interface through `index.ts`. This encapsulates internal implementation details.

### Example: User Entity

```typescript
// entities/user/index.ts
export { UserCard, UserAvatar, UserProfile } from './ui';
export { fetchUser, updateUser, deleteUser } from './api/userApi';
export { useUser, useUserPermissions } from './model/hooks';
export type { User, UserRole, UserProfile } from './model/types';
```

### Importing from Slices

✅ **Correct** - Import from public API:
```typescript
import { UserCard, useUser, type User } from '@/entities/user';
```

❌ **Wrong** - Direct import from internal segments:
```typescript
import { UserCard } from '@/entities/user/ui/UserCard';
import { useUser } from '@/entities/user/model/hooks';
```

## Creating New Slices

### 1. Choose the Right Layer

Ask yourself:
- Is it a domain model? → **entities**
- Is it a user interaction? → **features**
- Is it a composite UI block? → **widgets**
- Is it a route page? → **pages**
- Is it reusable across layers? → **shared**

### 2. Create the Slice Directory

```bash
mkdir -p src/[layer]/[slice-name]
```

### 3. Add Segments as Needed

```bash
# For a feature with UI, logic, and API
mkdir -p src/features/my-feature/{ui,model,api}
```

### 4. Create the Public API

```typescript
// src/features/my-feature/index.ts
export { MyComponent } from './ui';
export { useMyFeature } from './model/hooks';
export type { MyFeatureState } from './model/types';
```

### Example: Creating a Job Application Feature

```bash
# 1. Create directories
mkdir -p src/features/job-application/{ui,model,api}

# 2. Create files
touch src/features/job-application/ui/ApplicationForm.tsx
touch src/features/job-application/model/types.ts
touch src/features/job-application/model/hooks.ts
touch src/features/job-application/api/applicationApi.ts
touch src/features/job-application/index.ts
```

```typescript
// src/features/job-application/model/types.ts
export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}
```

```typescript
// src/features/job-application/api/applicationApi.ts
import { apiClient } from '@/shared/api';
import type { JobApplication } from '../model/types';

export async function submitApplication(data: Partial<JobApplication>) {
  const response = await apiClient.post('/applications', data);
  return response.data;
}
```

```typescript
// src/features/job-application/ui/ApplicationForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { submitApplication } from '../api/applicationApi';

export function ApplicationForm({ jobId }: { jobId: string }) {
  // Component implementation
}
```

```typescript
// src/features/job-application/index.ts
export { ApplicationForm } from './ui/ApplicationForm';
export { submitApplication } from './api/applicationApi';
export type { JobApplication, ApplicationStatus } from './model/types';
```

## Import Guidelines

### Path Aliases

Use the configured path aliases for clean imports:

```typescript
import { Button } from '@/shared/ui/button';
import { User } from '@/entities/user';
import { useAuth } from '@/features/authentication';
import { JobsList } from '@/widgets/jobs-list';
```

### Import Order

Recommended import order:

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import axios from 'axios';

// 2. FSD layers (top to bottom)
import { useAuth } from '@/features/authentication';
import { User } from '@/entities/user';
import { Button } from '@/shared/ui/button';
import { formatDate } from '@/shared/lib/utils';

// 3. Relative imports (same slice)
import { helper } from './lib/helper';
import styles from './Component.module.css';

// 4. Types
import type { ComponentProps } from './types';
```

### ESLint Validation

The project has ESLint rules to enforce FSD architecture:

```bash
# Check for violations
npm run lint

# Auto-fix where possible
npm run lint -- --fix
```

## Common Patterns

### Pattern 1: Feature Using Entity

```typescript
// features/job-application/ui/ApplicationForm.tsx
import { Job } from '@/entities/job';  // ✅ Feature can use entity
import { Button } from '@/shared/ui/button';  // ✅ Feature can use shared

export function ApplicationForm({ job }: { job: Job }) {
  // Implementation
}
```

### Pattern 2: Widget Composing Features

```typescript
// widgets/hr-dashboard/ui/HRDashboard.tsx
import { JobsList } from '@/features/job-management';  // ✅ Widget can use features
import { ApplicationsPanel } from '@/features/job-application';
import { CompanyProfile } from '@/entities/company';  // ✅ Widget can use entities

export function HRDashboard() {
  return (
    <div>
      <CompanyProfile />
      <JobsList />
      <ApplicationsPanel />
    </div>
  );
}
```

### Pattern 3: Page Composing Widgets

```typescript
// pages/hr/page.tsx
import { HRDashboard } from '@/widgets/hr-dashboard';  // ✅ Page can use widgets
import { QuickActions } from '@/features/quick-actions';  // ✅ Page can use features

export default function HRPage() {
  return (
    <div>
      <h1>HR Dashboard</h1>
      <QuickActions />
      <HRDashboard />
    </div>
  );
}
```

### Pattern 4: Shared API Client

```typescript
// shared/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// entities/user/api/userApi.ts
import { apiClient } from '@/shared/api';  // ✅ Entity uses shared API client

export async function fetchUser(id: string) {
  return apiClient.get(`/users/${id}`);
}
```

## Migration Guide

### Migrating Existing Code

When migrating code to FSD:

1. **Identify the layer** - Determine which layer the code belongs to
2. **Create the slice** - Set up the directory structure
3. **Move the code** - Place files in appropriate segments
4. **Create public API** - Export through index.ts
5. **Update imports** - Change imports to use new paths
6. **Test** - Ensure everything still works

### Example Migration

**Before** (traditional structure):
```
src/
├── components/
│   └── UserCard.tsx
├── lib/
│   └── userApi.ts
└── types/
    └── user.ts
```

**After** (FSD structure):
```
src/
└── entities/
    └── user/
        ├── ui/
        │   └── UserCard.tsx
        ├── api/
        │   └── userApi.ts
        ├── model/
        │   └── types.ts
        └── index.ts
```

### Handling Dependencies

If you encounter circular dependencies or import violations:

1. **Check layer hierarchy** - Ensure you're importing from lower layers
2. **Extract to shared** - Move common code to shared layer
3. **Refactor dependencies** - Break circular dependencies
4. **Use dependency inversion** - Pass dependencies as props/parameters

## Best Practices

### ✅ Do

- Keep slices focused and cohesive
- Use public APIs (index.ts) for all exports
- Follow the dependency rules strictly
- Co-locate tests with code
- Document complex slices
- Use TypeScript for type safety

### ❌ Don't

- Import from higher layers
- Create circular dependencies
- Import directly from internal segments
- Put business logic in shared layer
- Create feature-to-feature dependencies
- Skip the public API

## Resources

- [FSD Official Documentation](https://feature-sliced.design/)
- [Layer README files](./app/README.md) - Detailed documentation for each layer
- [ESLint Configuration](../eslint.config.mjs) - FSD rules enforcement

## Questions?

If you're unsure about where to place code or how to structure a slice:

1. Check the layer README files
2. Look at existing slices for examples
3. Ask the team for guidance
4. When in doubt, start with a simpler structure and refactor later

---

**Remember**: FSD is about creating a maintainable, scalable architecture. The rules exist to prevent common pitfalls and keep the codebase organized. Follow them, and your future self will thank you! 🚀
