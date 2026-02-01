# Pages Layer

## Purpose

The pages layer contains Next.js route pages that compose widgets, features, and entities. Pages handle routing, layout composition, and data fetching but contain minimal business logic.

## Responsibilities

- Next.js route pages
- Layout composition
- Widget, feature, and entity composition
- Route parameters and search params handling
- Page-level data fetching
- SEO metadata

## What Belongs Here

- **[route-name]/**: Individual page directories
  - **page.tsx**: Page component (Next.js convention)
  - **layout.tsx**: Layout component (Next.js convention)
  - **loading.tsx**: Loading state (Next.js convention)
  - **error.tsx**: Error boundary (Next.js convention)
  - **not-found.tsx**: 404 page (Next.js convention)

## Dependency Rules

The pages layer can import from:
- widgets
- features
- entities
- shared

The pages layer CANNOT import from:
- app
- processes
- other pages

## Structure Guidelines

```
pages/
├── home/
│   └── page.tsx
├── jobs/
│   ├── page.tsx              # Jobs list
│   ├── [id]/
│   │   └── page.tsx          # Job detail
│   └── create/
│       └── page.tsx          # Create job
└── profile/
    └── page.tsx
```

## Examples

```typescript
// pages/jobs/page.tsx
import { JobsList } from '@/widgets/jobs-list';
import { JobFilters } from '@/features/job-filters';

export default function JobsPage() {
  return (
    <div>
      <h1>Jobs</h1>
      <JobFilters />
      <JobsList />
    </div>
  );
}
```

```typescript
// pages/jobs/[id]/page.tsx
import { JobDetail } from '@/widgets/job-detail';
import { ApplyButton } from '@/features/job-application';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <JobDetail jobId={params.id} />
      <ApplyButton jobId={params.id} />
    </div>
  );
}
```

## Notes

- Pages should be thin - they compose, they don't implement
- Business logic belongs in features, not pages
- Keep pages focused on routing and composition
- Use Next.js conventions (page.tsx, layout.tsx, etc.)
- Server components by default, use "use client" only when needed
