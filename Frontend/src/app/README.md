# App Layer

## Purpose

The app layer is the highest layer in the FSD architecture. It handles application initialization, global providers, routing configuration, and global styles.

## Responsibilities

- Application initialization and bootstrapping
- Global providers (Redux, Authentication, Theme)
- Root layout and routing configuration
- Global styles and fonts
- Application-wide error boundaries

## What Belongs Here

- **providers/**: Global context providers and store configuration
- **styles/**: Global CSS, CSS variables, and theme definitions
- **layout.tsx**: Root layout component
- **page.tsx**: Root page component
- **error.tsx**: Global error boundary

## Dependency Rules

The app layer can import from:
- processes
- pages
- widgets
- features
- entities
- shared

## Examples

```typescript
// app/providers/index.tsx
import { ReduxProvider } from './ReduxProvider';
import { AuthProvider } from '@/features/authentication';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReduxProvider>
  );
}
```

## Notes

- Keep this layer minimal - it should primarily compose providers and configure the application
- Business logic belongs in features, not here
- This layer orchestrates the entire application but doesn't implement functionality
