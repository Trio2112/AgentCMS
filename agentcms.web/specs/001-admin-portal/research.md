# Research: AgentCMS Admin Portal Technology Decisions

**Feature**: AgentCMS Admin Portal  
**Date**: February 13, 2026  
**Purpose**: Document technology choices, alternatives considered, and best practices for admin portal implementation

**Scope Note**: This feature uses simplified publishing (boolean flag, no scheduled dates) and independent asset management (no page-asset associations).

## 1. Frontend Framework Selection

### Decision: React 18.2+ with TypeScript

**Rationale**:
- **Type Safety**: TypeScript provides compile-time type checking for API contracts, reducing runtime errors
- **Ecosystem Maturity**: React has extensive libraries for admin UIs and excellent accessibility tooling
- **Performance**: React 18's concurrent rendering supports the <2s action feedback requirement
- **Testing**: Rich testing ecosystem (React Testing Library, Vitest, Playwright)

**Alternatives Considered**:
- **Vue 3**: Smaller ecosystem for enterprise admin panels
- **Svelte**: Smaller library ecosystem, fewer accessibility-focused components
- **Angular**: Over-engineered for this scope
- **Vanilla JS**: Violates maintainability principle

---

## 2. State Management Approach

### Decision: TanStack Query (React Query) + Local Component State

**Rationale**:
- **Server State Separation**: TanStack Query handles API data fetching, caching, and synchronization
- **Optimistic Updates**: Built-in support for optimistic UI updates (Constitution: Responsiveness)
- **Error Handling**: Automatic retry logic with exponential backoff
- **Performance**: Intelligent caching reduces unnecessary API calls
- **Simplicity**: No need for Redux/Zustand for simple UI state

**Implementation Pattern**:
```typescript
// Publish page with optimistic update
function usePublishPage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (pageId: string, isPublished: boolean) => 
      api.pages.update(pageId, { isPublished }),
    onMutate: async ({ pageId, isPublished }) => {
      await queryClient.cancelQueries({ queryKey: ['pages'] })
      const previousPages = queryClient.getQueryData(['pages'])
      
      queryClient.setQueryData(['pages'], (old: Page[]) =>
        old.map(p => p.id === pageId ? { ...p, isPublished } : p)
      )
      
      return { previousPages }
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['pages'], context.previousPages)
    },
  })
}
```

---

## 3. Form Validation Strategy

### Decision: Zod + React Hook Form

**Rationale**:
- **TypeScript-First**: Zod schemas generate TypeScript types automatically
- **Runtime Validation**: Client-side validation before API submission
- **File Upload Validation**: Perfect for validating file size, MIME type before upload
- **React Hook Form Integration**: Seamless integration via `@hookform/resolvers`

**Implementation Pattern**:
```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  body: z.string().optional(),
  isPublished: z.boolean(),
})

type PageFormData = z.infer<typeof pageSchema>

function PageForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      <label>
        <input type="checkbox" {...register('isPublished')} />
        Publish
      </label>
    </form>
  )
}
```

---

## 4. File Upload Validation

### Decision: Client-Side Pre-Flight Validation with Zod

**Rationale**:
- **Immediate Feedback**: Validate file size and MIME type before upload begins (FR-019, FR-020)
- **UX Requirement**: "reject immediately with specific message if invalid"
- **Cost Savings**: Prevents unnecessary upload bandwidth for invalid files

**Implementation Pattern**:
```typescript
const MAX_FILE_SIZE_MB = 10
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/html']

const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024, 
      `File size must be less than ${MAX_FILE_SIZE_MB}MB`)
    .refine((file) => ALLOWED_MIME_TYPES.includes(file.type),
      'File type not supported. Allowed: JPEG, PNG, GIF, PDF, HTML'),
})

function AssetUpload() {
  const handleFile = (file: File) => {
    const result = fileSchema.safeParse({ file })
    
    if (!result.success) {
      toast.error(result.error.errors[0].message)
      return
    }
    
    uploadAsset(file)
  }
}
```

---

## 5. Concurrent Edit Detection

### Decision: Optimistic Locking with `lastModified` Timestamp

**Rationale**:
- **Last Save Wins**: Matches clarification requirement
- **Warning Before Overwrite**: Detect if page modified since current user opened it
- **Simple Implementation**: Compare timestamps, no complex distributed locks
- **User Control**: Warning gives user choice to proceed or cancel

**Implementation Pattern**:
```typescript
interface Page {
  id: string
  title: string
  isPublished: boolean
  lastModified: string
  updatedBy: string
}

function PageForm({ page }: { page: Page }) {
  const [originalLastModified] = useState(page.lastModified)
  
  const updateMutation = useMutation({
    mutationFn: (data: PageFormData) => api.pages.update(page.id, data),
    onMutate: async () => {
      const current = await api.pages.get(page.id)
      
      if (current.lastModified !== originalLastModified) {
        const proceed = await confirm(
          `Warning: Modified by ${current.updatedBy}. Proceed?`
        )
        if (!proceed) throw new Error('User cancelled')
      }
    },
  })
}
```

---

## 6. Accessibility Implementation (WCAG 2.1 Level AA)

### Decision: axe-core + React-ARIA/Radix UI + Manual Testing

**Rationale**:
- **Automated Testing**: axe-core catches ~57% of accessibility issues
- **Accessible Primitives**: React-ARIA and Radix UI provide WCAG-compliant components
- **Manual Testing**: Keyboard navigation and screen reader testing for remaining issues

**Implementation Checklist**:
- Keyboard Navigation: Tab order, Escape to close, Enter to submit
- Screen Reader Support: ARIA labels, roles, live regions
- Focus Management: Focus trap in modals
- Color Contrast: WCAG AA requires 4.5:1 for normal text
- Form Labels: All inputs have associated labels
- Error Identification: Errors announced to screen readers

**Testing Integration**:
```typescript
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('PageForm has no accessibility violations', async () => {
  const { container } = render(<PageForm />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## 7. Performance Optimization Strategies

### Decision: Code Splitting + Virtualization + TanStack Query Caching

**Rationale**:
- **<3s Page Load**: Code splitting reduces initial bundle size
- **Large Lists**: Virtualization prevents DOM bloat for >50 items
- **Cache Strategy**: TanStack Query reduces redundant API calls

**Implementation**:
```typescript
// Code splitting with React.lazy()
import { lazy, Suspense } from 'react'

const PagesPage = lazy(() => import('./features/pages/components/PagesPage'))
const AssetsPage = lazy(() => import('./features/assets/components/AssetsPage'))

// Virtualized list for large datasets
import { useVirtualizer } from '@tanstack/react-virtual'

function PagesList({ pages }: { pages: Page[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div key={item.index}>{pages[item.index].title}</div>
        ))}
      </div>
    </div>
  )
}
```

---

## 8. Build Tool Selection

### Decision: Vite

**Rationale**:
- **Fast HMR**: Near-instant hot module replacement during development
- **Modern Defaults**: ESM, TypeScript, JSX support out of the box
- **Optimized Builds**: Rollup-based production builds with tree-shaking
- **Simple Configuration**: Minimal config compared to Webpack

---

## 9. Testing Strategy

### Decision: Vitest (unit) + React Testing Library (component) + Playwright (E2E)

**Testing Pyramid**:
- **Unit Tests (80% coverage target)**: Zod schemas, utility functions, hooks
- **Component Tests**: User interactions, form submissions, error states
- **E2E Tests**: P1 user stories (create/publish page, upload asset, manage sites)
- **Accessibility Tests**: axe-core on all components

---

## 10. API Integration Pattern

### Decision: Centralized API Client with Type-Safe Contracts

**Implementation**:
```typescript
// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }
  
  return response.json()
}

// src/api/pages.ts
export const pagesApi = {
  list: (siteId: string) => request<Page[]>(`/v1/sites/${siteId}/pages`),
  get: (siteId: string, id: string) => request<Page>(`/v1/sites/${siteId}/pages/${id}`),
  create: (siteId: string, data: CreatePageDto) => 
    request<Page>(`/v1/sites/${siteId}/pages`, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  update: (siteId: string, id: string, data: UpdatePageDto) =>
    request<Page>(`/v1/sites/${siteId}/pages/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
}
```

---

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| Framework | React 18 + TypeScript | Type safety, ecosystem maturity |
| State Management | TanStack Query + local state | Server state separation, optimistic updates |
| Validation | Zod + React Hook Form | Runtime validation, type inference |
| File Upload | Client-side pre-flight validation | Immediate feedback, bandwidth savings |
| Concurrent Edits | Optimistic locking with timestamps | Simple, meets requirements |
| Accessibility | axe-core + React-ARIA + manual testing | WCAG 2.1 AA compliance |
| Performance | Code splitting + virtualization + caching | <3s page load, <2s action feedback |
| Build Tool | Vite | Fast HMR, modern defaults |
| Testing | Vitest + RTL + Playwright + axe-core | Comprehensive coverage |
| API Integration | Centralized typed client | Type safety, error handling |

---

## Implementation Notes

- **No Backend Blockers**: Existing API already has `isPublished` boolean on Page entity
- **Simplified Scope**: No scheduled publishing (no publishedDate field), no page-asset associations
- **Feature Independence**: Sites, Pages, and Assets are independently implementable and testable
- **Accessibility First**: axe-core integrated into component tests from day one
