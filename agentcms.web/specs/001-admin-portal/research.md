# Research: AgentCMS Admin Portal Technology Decisions

**Feature**: AgentCMS Admin Portal  
**Date**: February 13, 2026  
**Purpose**: Document technology choices, alternatives considered, and best practices for admin portal implementation

## 1. Frontend Framework Selection

### Decision: React 18.2+ with TypeScript

**Rationale**:
- **Type Safety**: TypeScript provides compile-time type checking for API contracts, reducing runtime errors and improving maintainability (Constitution: Maintainability)
- **Ecosystem Maturity**: React has extensive libraries for admin UIs (tables, forms, date pickers) and excellent accessibility tooling (react-aria, Radix UI)
- **Team Familiarity**: React is industry-standard with abundant documentation and talent pool
- **Performance**: React 18's concurrent rendering and automatic batching support the <2s action feedback requirement (SC-004)
- **Testing**: Rich testing ecosystem (React Testing Library, Vitest, Playwright) aligns with Constitution requirement for maintainability

**Alternatives Considered**:
- **Vue 3**: Comparable capabilities but smaller ecosystem for enterprise admin panels; less TypeScript-first
- **Svelte**: Excellent performance but smaller library ecosystem, fewer accessibility-focused component libraries
- **Angular**: Over-engineered for this scope; heavy framework not needed for focused admin portal
- **Vanilla JS**: Would require building all components from scratch, violating Constitution principle of maintainability

**Supporting Research**:
- React 18 best practices: [React.dev Documentation](https://react.dev/)
- Admin panel patterns: Material-UI, Ant Design, Chakra UI component libraries provide proven patterns
- WCAG 2.1 AA in React: React-ARIA provides accessible primitives; Radix UI has built-in accessibility

---

## 2. State Management Approach

### Decision: TanStack Query (React Query) + Local Component State

**Rationale**:
- **Server State Separation**: TanStack Query handles API data fetching, caching, and synchronization—matches our API-backed architecture
- **Optimistic Updates**: Built-in support for optimistic UI updates (Constitution: Responsiveness)
- **Error Handling**: Automatic retry logic with exponential backoff aligns with "Try Again" requirement from clarifications
- **Performance**: Intelligent caching reduces unnecessary API calls, supporting <3s page load goal (SC-003)
- **Simplicity**: No need for Redux/Zustand for simple UI state (form inputs, modals); local component state sufficient

**Alternatives Considered**:
- **Redux Toolkit**: Over-engineered for this scope; adds boilerplate for server state that TanStack Query handles better
- **Zustand**: Good for global UI state but doesn't solve server state management; would still need TanStack Query
- **Context API only**: Insufficient for complex async state, caching, and optimistic updates; poor performance at scale
- **Apollo Client**: GraphQL-specific; existing API is REST, would require backend changes

**Implementation Pattern**:
```typescript
// TanStack Query for server state
const { data: pages, isLoading } = useQuery(['pages', siteId], () => fetchPages(siteId))

// Local state for form inputs
const [title, setTitle] = useState('')

// Mutations with optimistic updates
const mutation = useMutation(createPage, {
  onMutate: async (newPage) => {
    // Optimistic update: add to list immediately
    await queryClient.cancelQueries(['pages', siteId])
    const previous = queryClient.getQueryData(['pages', siteId])
    queryClient.setQueryData(['pages', siteId], (old) => [...old, newPage])
    return { previous }
  },
  onError: (err, newPage, context) => {
    // Rollback on error, show retry option
    queryClient.setQueryData(['pages', siteId], context.previous)
  }
})
```

---

## 3. Form Handling Strategy

### Decision: Controlled Components with Zod Validation

**Rationale**:
- **Controlled Components**: React's native form handling keeps form state in sync with component state; simple, predictable
- **Zod**: TypeScript-first validation library generates both runtime validation and TypeScript types from single schema
- **Client-Side Validation**: Required for FR-022 (validate file before upload) and FR-019/FR-020 (required field validation)
- **Error Preservation**: Controlled components naturally preserve form data on validation errors (clarification requirement)

**Alternatives Considered**:
- **React Hook Form**: Excellent library but adds dependency; overkill for simple forms in this app (4 entity types with 2-4 fields each)
- **Formik**: Mature but heavier than needed; slower updates compared to controlled components
- **Uncontrolled Components**: Don't integrate well with React Query optimistic updates; harder to preserve state on errors
- **Yup Validation**: Less TypeScript-native than Zod; Zod's type inference is superior

**Validation Example**:
```typescript
import { z } from 'zod'

const PageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  body: z.string().optional(),
  publishedDate: z.date().nullable(),
})

type PageFormData = z.infer<typeof PageSchema>

// In component:
const handleSubmit = (data: PageFormData) => {
  const result = PageSchema.safeParse(data)
  if (!result.success) {
    setErrors(result.error.flatten())
    return
  }
  mutation.mutate(result.data)
}
```

---

## 4. File Upload Implementation

### Decision: Client-Side Validation + Direct Multipart POST to API

**Rationale**:
- **FR-022/FR-023 Requirement**: Must validate file size and MIME type *before* upload starts
- **Simplicity**: Direct POST to API avoids complexity of presigned URLs or separate storage service
- **Existing API**: Swagger.json shows `/v1/sites/{siteId}/assets` endpoint likely accepts multipart uploads
- **Error Handling**: Immediate rejection on client side (before network round-trip) provides fast feedback per Constitution: Responsiveness

**Validation Logic**:
```typescript
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/html']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const validateFile = (file: File): ValidationResult => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Unsupported file type: ${file.type}` }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)` }
  }
  return { valid: true }
}
```

**Alternatives Considered**:
- **Presigned URLs (S3/Azure Blob)**: More scalable for large files but adds complexity; existing API doesn't indicate this pattern
- **Chunked Upload**: Overkill for 10MB limit; adds complexity without clear benefit
- **Server-Side Only Validation**: Would waste bandwidth and time uploading invalid files (violates FR-022)

**Upload Progress**:
- Use Axios progress events to show upload progress bar
- Optimistic UI: show file in list immediately, mark as "uploading", update on success/failure

---

## 5. Authentication Integration

### Decision: Detect and Integrate with Existing Auth System

**Rationale**:
- **Assumption from Spec**: "Content managers have appropriate authentication credentials" (Assumptions section)
- **Out of Scope**: "authentication mechanism is out of scope for this spec" (Assumptions section)
- **Pragmatic Approach**: Frontend assumes API enforces auth via HTTP headers (JWT Bearer token or session cookie)

**Implementation Strategy**:
1. **Discovery Phase**: Check if existing API uses:
   - Bearer token (Authorization: Bearer <token>)
   - Session cookies (HttpOnly cookie-based auth)
   - API key headers
2. **Axios Interceptor**: Attach auth credentials to all requests
3. **Error Handling**: 401 responses redirect to login page (or show auth error if no login UI in scope)

```typescript
// api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') // or detect cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or show auth modal
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

**Note**: If auth system is undefined, frontend can proceed with placeholder ("all managers have access" per clarification) and integrate auth later without major refactoring.

---

## 6. Accessibility Testing Toolchain

### Decision: axe-core + Playwright + Manual Testing Checklist

**Rationale**:
- **FR-027**: Must conform to WCAG 2.1 Level AA
- **SC-008**: Validated via automated tools and manual keyboard navigation
- **axe-core**: Industry-standard accessibility testing library; catches 57% of WCAG issues automatically
- **Playwright Integration**: axe-core runs in E2E tests, ensuring regression prevention
- **Manual Checklist**: Required for remaining 43% of issues (keyboard nav, screen reader compatibility, focus management)

**Toolchain Components**:
1. **Development**: axe DevTools browser extension for real-time feedback
2. **CI/CD**: @axe-core/playwright integration runs accessibility scans on every commit
3. **Manual Testing**: Keyboard-only navigation checklist + screen reader testing (NVDA/JAWS on Windows, VoiceOver on Mac)

**Implementation**:
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('Page creation form is accessible', async ({ page }) => {
  await page.goto('/sites/123/pages/new')
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  
  expect(accessibilityScanResults.violations).toEqual([])
})
```

**Accessibility Patterns**:
- Semantic HTML (nav, main, article, section) for screen reader landmarks
- ARIA labels on icon buttons and interactive elements
- Focus management on modal open/close
- Skip links for keyboard navigation
- Color contrast ratios >= 4.5:1 (WCAG AA requirement)
- Form error messages associated with inputs via aria-describedby

---

## 7. CI/CD Integration

### Decision: GitHub Actions with Vitest, Playwright, Lighthouse CI

**Rationale**:
- **GitHub Actions**: Likely existing CI system if repository is on GitHub; otherwise adaptable to GitLab CI, Azure DevOps
- **Vitest**: Fast unit test runner, 10x faster than Jest for modern projects
- **Playwright**: Cross-browser E2E testing (Chromium, Firefox, WebKit) ensures compatibility
- **Lighthouse CI**: Automated performance audits enforce SC-003 (p95 <3s page load)

**Pipeline Structure**:
```yaml
name: Admin Portal CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run Lighthouse CI
        run: npm run lighthouse
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**Performance Budgets** (Lighthouse CI config):
```json
{
  "ci": {
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 3000}],
        "speed-index": ["error", {"maxNumericValue": 3000}]
      }
    }
  }
}
```

---

## 8. API Modification Requirements (publishedDate Field)

### Problem: Missing `publishedDate` Field in Existing API

**Current API State** (per agentcms.api-swagger.json):
- `PageDto` has `isPublished: boolean` but no `publishedDate` field
- Cannot implement scheduled publishing (FR-021) without API change

**Required API Changes**:

#### Option A: Add publishedDate to Page Entity (Recommended)
```json
{
  "PageDto": {
    "properties": {
      "publishedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true,
        "description": "Publication date. If null, page is unpublished. If future date, page is scheduled."
      },
      "isPublished": {
        "type": "boolean",
        "readOnly": true,
        "description": "Computed: publishedDate != null && publishedDate <= now()"
      }
    }
  }
}
```

**Backend Implementation**:
- Add `PublishedDate` column to Pages table (nullable DateTime)
- Compute `IsPublished` property: `get => PublishedDate.HasValue && PublishedDate.Value <= DateTime.UtcNow`
- Update `CreatePageDto` and `UpdatePageDto` to accept `PublishedDate?` (remove `IsPublished` from input DTOs)

#### Option B: Interim Solution (Toggle-Only Publishing)
If API changes are blocked/delayed:
- Use existing `isPublished` boolean for immediate publish/unpublish only
- Implement scheduling in Phase 2 after API is updated
- Frontend shows "Publish Now" / "Unpublish" buttons instead of date picker

**Recommendation**: Prioritize Option A (API update) as Phase 2 foundational task before implementing User Story 1. Scheduling is core to spec requirements (FR-021, SC-005).

---

## 9. Concurrent Edit Detection Strategy

### Decision: Use `updatedDate` Timestamp Comparison

**Rationale**:
- **API Support**: PageDto already has `updatedDate` field (per swagger.json)
- **Simple Implementation**: When user opens page for editing, store `updatedDate`. Before saving, fetch current `updatedDate` and compare.
- **No ETag Required**: Avoids need for API to support ETags/If-Match headers

**Frontend Implementation**:
```typescript
const PageEditForm = ({ pageId }) => {
  const { data: page } = useQuery(['page', pageId], () => fetchPage(pageId))
  const [originalUpdatedDate, setOriginalUpdatedDate] = useState(page.updatedDate)

  const mutation = useMutation(updatePage, {
    onMutate: async (updatedData) => {
      // Before saving, check if page was modified by someone else
      const currentPage = await fetchPage(pageId)
      if (currentPage.updatedDate !== originalUpdatedDate) {
        const confirmed = window.confirm(
          `This page was modified by ${currentPage.updatedBy} at ${currentPage.updatedDate}. ` +
          `Your changes will overwrite theirs. Continue?`
        )
        if (!confirmed) {
          throw new Error('Save cancelled by user')
        }
      }
      return updatedData
    }
  })
}
```

**Alternatives**:
- **ETags**: More robust but requires API to implement ETag generation and If-Match header validation
- **Pessimistic Locking**: Would require lock/unlock API endpoints; violates clarification decision (allow concurrent edits)
- **Operational Transforms**: Over-engineered for this use case; no real-time collaboration requirement

---

## 10. Date/Time Handling for Scheduling

### Decision: date-fns + UTC Storage, Local Display

**Rationale**:
- **date-fns**: Modern, tree-shakeable, better TypeScript support than Moment.js
- **UTC Storage**: API stores all dates in UTC (standard practice)
- **Local Display**: Show scheduled times in user's local timezone with explicit indication

**Implementation**:
```typescript
import { format, parseISO, isPast } from 'date-fns'

const isPublished = (publishedDate: string | null): boolean => {
  if (!publishedDate) return false
  return isPast(parseISO(publishedDate))
}

const formatPublishDate = (publishedDate: string | null): string => {
  if (!publishedDate) return 'Not Published'
  const date = parseISO(publishedDate)
  if (isPast(date)) return `Published ${format(date, 'MMM d, yyyy h:mm a')}`
  return `Scheduled for ${format(date, 'MMM d, yyyy h:mm a')}`
}
```

**UI Component**:
- Use native `<input type="datetime-local">` for date picker (built-in validation, accessibility)
- Convert to/from ISO 8601 UTC strings for API communication
- Display warning if user selects past date on new page ("This page will be published immediately")

---

## 11. Table/List Pagination and Filtering

### Decision: Server-Side Pagination + Client-Side Filtering (Hybrid)

**Rationale**:
- **Performance**: Client-side filtering acceptable for typical admin workload (<1000 items per entity type)
- **API Constraints**: Existing API may not support query parameters for filtering (not visible in swagger.json)
- **Future-Proof**: If scale grows, can migrate to server-side filtering without UI changes

**Implementation**:
```typescript
const SiteList = () => {
  const { data: sites } = useQuery(['sites'], fetchAllSites)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSites = useMemo(() => {
    return sites?.filter(site => 
      site.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ?? []
  }, [sites, searchTerm])

  return (
    <div>
      <input 
        type="search" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search sites..."
      />
      <table>
        {filteredSites.map(site => <SiteRow key={site.id} site={site} />)}
      </table>
    </div>
  )
}
```

**Pagination** (if needed later):
- Use TanStack Query's infinite scroll capability for large lists
- OR add server-side pagination query params: `?page=1&pageSize=50`

---

## Summary of Decisions

| Decision Area | Choice | Key Rationale |
|---------------|--------|---------------|
| Framework | React 18 + TypeScript | Mature ecosystem, type safety, accessibility tooling |
| State Management | TanStack Query + Local State | Optimized for API-backed state, built-in caching/retry |
| Forms | Controlled Components + Zod | Simple, TypeScript-native validation |
| File Upload | Client Validation + Direct POST | Meets FR-022 (validate before upload) |
| Authentication | Integrate Existing (Bearer/Cookie) | Out of scope for spec; detect and adapt |
| Accessibility | axe-core + Playwright + Manual | Automated + manual coverage for WCAG 2.1 AA |
| CI/CD | GitHub Actions + Lighthouse CI | Automated testing and performance monitoring |
| API Changes | Add publishedDate field | **Blocking** for scheduled publishing (FR-021) |
| Concurrent Edits | updatedDate comparison | Simple, leverages existing API field |
| Date Handling | date-fns + UTC storage | Modern library, timezone-safe |
| Lists | Client-side filter, optional pagination | Sufficient for admin scale |

**Critical Path Items**:
1. **API Update**: Add `publishedDate` to Page entity (backend team dependency)
2. **Auth Discovery**: Identify existing authentication mechanism
3. **Asset Upload**: Confirm API endpoint accepts multipart/form-data

**Next Phase**: Generate data-model.md, contracts/, and quickstart.md based on these decisions.
