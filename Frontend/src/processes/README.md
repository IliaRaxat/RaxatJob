# Processes Layer

## Purpose

The processes layer handles complex inter-feature business processes that span multiple features. This layer is optional and should only be used when you have workflows that coordinate multiple features.

## Responsibilities

- Multi-step business workflows
- Complex processes involving multiple features
- Cross-feature orchestration
- Process state management

## What Belongs Here

- **[process-name]/**: Individual process slices
  - **model/**: Process state and orchestration logic
  - **ui/**: Process-specific UI components (wizards, steppers)
  - **lib/**: Process helper functions

## Dependency Rules

The processes layer can import from:
- pages
- widgets
- features
- entities
- shared

The processes layer CANNOT import from:
- app

## When to Use This Layer

Use the processes layer when:
- A workflow spans multiple features
- You need to coordinate state across features
- The process has multiple steps that involve different features

Don't use this layer for:
- Single-feature workflows (put them in features)
- Simple compositions (use widgets or pages)

## Examples

```typescript
// processes/job-application-flow/model/useApplicationFlow.ts
import { useJobApplication } from '@/features/job-application';
import { useResume } from '@/entities/resume';
import { useAuth } from '@/features/authentication';

export function useApplicationFlow() {
  const { user } = useAuth();
  const { submitApplication } = useJobApplication();
  const { resumes } = useResume();
  
  // Orchestrate multi-feature workflow
  const startApplication = async (jobId: string) => {
    // Complex logic coordinating multiple features
  };
  
  return { startApplication };
}
```

## Notes

- This layer is optional - most applications won't need it
- If you're unsure whether to use this layer, you probably don't need it
- Keep processes focused on orchestration, not implementation
