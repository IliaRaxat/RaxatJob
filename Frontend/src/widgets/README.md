# Widgets Layer

## Purpose

The widgets layer contains large composite UI blocks that combine multiple features and entities. Widgets are reusable across multiple pages and handle complex UI composition without business logic.

## Responsibilities

- Complex UI composition
- Combining multiple features and entities
- Layout and presentation logic
- Reusable composite components

## What Belongs Here

- **[widget-name]/**: Individual widget slices
  - **ui/**: Widget UI components
  - **model/**: Widget-specific state (UI state only, not business logic)
  - **lib/**: Widget helper functions
  - **index.ts**: Public API

## Dependency Rules

The widgets layer can import from:
- features
- entities
- shared

The widgets layer CANNOT import from:
- app
- processes
- pages
- other widgets (avoid widget-to-widget dependencies)

## Slice Structure

```
widgets/
├── hr-dashboard/
│   ├── ui/
│   │   ├── HRDashboard.tsx
│   │   ├── HRDashboard.module.css
│   │   └── components/
│   │       ├── StatsPanel.tsx
│   │       └── ActivityFeed.tsx
│   └── index.ts
└── student-card/
    ├── ui/
    │   ├── StudentCard.tsx
    │   └── StudentCard.module.css
    └── index.ts
```

## Examples

```typescript
// widgets/hr-dashboard/ui/HRDashboard.tsx
import { JobsList } from '@/features/job-management';
import { ApplicationsPanel } from '@/features/job-application';
import { CompanyProfile } from '@/entities/company';

export function HRDashboard() {
  return (
    <div className={styles.dashboard}>
      <CompanyProfile />
      <JobsList />
      <ApplicationsPanel />
    </div>
  );
}
```

```typescript
// widgets/hr-dashboard/index.ts
export { HRDashboard } from './ui/HRDashboard';
```

## Guidelines

- Widgets compose features and entities, they don't implement business logic
- Keep widgets focused on UI composition and layout
- Widgets should be reusable across multiple pages
- Avoid widget-to-widget dependencies
- Use features for business logic, widgets for UI composition
- CSS modules should be co-located with components

## When to Create a Widget

Create a widget when:
- You have a complex UI block used across multiple pages
- The component composes multiple features or entities
- The component has significant layout complexity

Don't create a widget for:
- Simple compositions (use page-level composition)
- Single-feature UI (belongs in the feature)
- Single-entity UI (belongs in the entity)

## Notes

- Widgets are about UI composition, not business logic
- If you find yourself adding business logic, it probably belongs in a feature
- Widgets can have local UI state but not business state
- Keep widgets reusable and generic
