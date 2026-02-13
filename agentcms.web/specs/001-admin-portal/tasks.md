# Implementation Tasks: AgentCMS Admin Portal

**Feature Branch**: `001-admin-portal`  
**Generated**: February 13, 2026  
**Total Tasks**: 60  
**Scope**: Simplified - isPublished boolean only, no page-asset associations

---

## Phase 1: Setup & Infrastructure (10 tasks)

- [X] T001 [P0] [Setup] Create feature branch `001-admin-portal` from main at `C:\data\git\AgentCMS\agentcms.web`
- [X] T002 [P0] [Setup] Install dependencies (React 18.2+, TypeScript 5.3+, TanStack Query, Zod, React Router, React Hook Form) via `package.json`
- [X] T003 [P0] [Setup] Configure Vite build tool with TypeScript and React plugin at `vite.config.ts`
- [X] T004 [P0] [Setup] Configure TypeScript strict mode and path aliases at `tsconfig.json`
- [X] T005 [P0] [Setup] Set up ESLint with accessibility rules (jsx-a11y) at `.eslintrc.cjs`
- [X] T006 [P0] [Setup] Configure Vitest for unit testing at `vitest.config.ts`
- [X] T007 [P0] [Setup] Configure Playwright for E2E testing at `playwright.config.ts`
- [X] T008 [P0] [Setup] Set up axe-core for accessibility testing in `src/test/setup.ts`
- [X] T009 [P0] [Setup] Create feature-based directory structure: `src/features/{sites,pages,assets}`
- [X] T010 [P0] [Setup] Configure API client with base URL from environment at `src/api/client.ts`

---

## Phase 2: Foundational Components (13 tasks)

- [X] T011 [P1] [Foundation] Create global type definitions for API models at `src/types/api.ts`
- [X] T012 [P1] [Foundation] Create shared Zod schemas for validation at `src/schemas/index.ts`
- [X] T013 [P1] [Foundation] Implement TanStack Query setup with error handling at `src/query/client.ts`
- [X] T014 [P1] [Foundation] Create Layout component with navigation and breadcrumbs at `src/components/Layout.tsx`
- [X] T015 [P1] [Foundation] Create Button component with loading/disabled states at `src/components/Button.tsx`
- [X] T016 [P1] [Foundation] Create Input component with validation error display at `src/components/Input.tsx`
- [X] T017 [P1] [Foundation] Create TextArea component with character count at `src/components/TextArea.tsx`
- [X] T018 [P1] [Foundation] Create Select component with keyboard navigation at `src/components/Select.tsx`
- [X] T019 [P1] [Foundation] Create ErrorBoundary with fallback UI at `src/components/ErrorBoundary.tsx`
- [X] T020 [P1] [Foundation] Create Toast notification system for feedback at `src/components/Toast.tsx`
- [X] T021 [P1] [Foundation] Create Modal component with focus trap at `src/components/Modal.tsx`
- [X] T022 [P1] [Foundation] Create ConfirmDialog component for destructive actions at `src/components/ConfirmDialog.tsx`
- [X] T023 [P1] [Foundation] Create LoadingSpinner with accessible labels at `src/components/LoadingSpinner.tsx`

---

## Phase 3: US3 Site Management (11 tasks)

**User Story**: As a content manager, I want to manage multiple websites so that I can organize content for different brands/campaigns.

- [X] T024 [P1] [US3] Define Site data model and Zod schema at `src/features/sites/types.ts`
- [X] T025 [P1] [US3] Create `useSites` query hook for listing at `src/features/sites/hooks/useSites.ts`
- [X] T026 [P1] [US3] Create `useCreateSite` mutation hook at `src/features/sites/hooks/useCreateSite.ts`
- [X] T027 [P1] [US3] Create `useUpdateSite` mutation hook with optimistic updates at `src/features/sites/hooks/useUpdateSite.ts`
- [X] T028 [P1] [US3] Create `useDeleteSite` mutation hook with confirmation at `src/features/sites/hooks/useDeleteSite.ts`
- [X] T029 [P1] [US3] Build SiteList component with table/grid view toggle at `src/features/sites/components/SiteList.tsx`
- [X] T030 [P1] [US3] Build SiteForm component with name/domain validation at `src/features/sites/components/SiteForm.tsx`
- [X] T031 [P1] [US3] Build SitesPage with list and create button at `src/features/sites/pages/SitesPage.tsx`
- [X] T032 [P1] [US3] Write unit tests for site hooks in `src/features/sites/hooks/*.test.ts`
- [X] T033 [P1] [US3] Write component tests for SiteList in `src/features/sites/components/SiteList.test.tsx`
- [X] T034 [P1] [US3] Write E2E test for complete site CRUD flow in `tests/e2e/sites.spec.ts`
- [ ] T028 [P1] [US3] Create `useDeleteSite` mutation hook with confirmation at `src/features/sites/hooks/useDeleteSite.ts`
- [ ] T029 [P1] [US3] Build SiteList component with table/grid view toggle at `src/features/sites/components/SiteList.tsx`
- [ ] T030 [P1] [US3] Build SiteForm component with name/domain validation at `src/features/sites/components/SiteForm.tsx`
- [ ] T031 [P1] [US3] Build SitesPage with list and create button at `src/features/sites/pages/SitesPage.tsx`
- [ ] T032 [P1] [US3] Write unit tests for site hooks in `src/features/sites/hooks/*.test.ts`
- [ ] T033 [P1] [US3] Write component tests for SiteList in `src/features/sites/components/SiteList.test.tsx`
- [ ] T034 [P1] [US3] Write E2E test for complete site CRUD flow in `tests/e2e/sites.spec.ts`

---

## Phase 4: US1 Page Management (16 tasks)

**User Story**: As a content manager, I want to create and edit pages with rich text content so that I can publish website content.

- [X] T035 [P1] [US1] Define Page data model with isPublished boolean at `src/features/pages/types.ts`
- [X] T036 [P1] [US1] Create Zod schema for page validation (title required, body optional) at `src/features/pages/schemas.ts`
- [X] T037 [P1] [US1] Create `usePages` query hook with site filtering at `src/features/pages/hooks/usePages.ts`
- [X] T038 [P1] [US1] Create `usePage` query hook for single page at `src/features/pages/hooks/usePage.ts`
- [X] T039 [P1] [US1] Create `useCreatePage` mutation hook with default isPublished=false at `src/features/pages/hooks/useCreatePage.ts`
- [X] T040 [P1] [US1] Create `useUpdatePage` mutation hook with lastModified concurrency check at `src/features/pages/hooks/useUpdatePage.ts`
- [X] T041 [P1] [US1] Create `useDeletePage` mutation hook with confirmation at `src/features/pages/hooks/useDeletePage.ts`
- [X] T042 [P1] [US1] Create `useTogglePublish` mutation hook for isPublished toggle at `src/features/pages/hooks/useTogglePublish.ts`
- [X] T043 [P1] [US1] Build PageList component with site filter dropdown at `src/features/pages/components/PageList.tsx`
- [X] T044 [P1] [US1] Build PageEditor component with title/body fields at `src/features/pages/components/PageEditor.tsx`
- [X] T045 [P1] [US1] Add publish toggle button with confirmation in PageEditor at `src/features/pages/components/PageEditor.tsx`
- [X] T046 [P1] [US1] Add concurrent edit detection warning in PageEditor at `src/features/pages/components/PageEditor.tsx`
- [X] T047 [P1] [US1] Build PagesPage with list and create button at `src/features/pages/pages/PagesPage.tsx`
- [X] T048 [P1] [US1] Write unit tests for page hooks in `src/features/pages/hooks/*.test.ts`
- [X] T049 [P1] [US1] Write component tests for PageEditor in `src/features/pages/components/PageEditor.test.tsx`
- [X] T050 [P1] [US1] Write E2E test for page creation, editing, and publish toggle in `tests/e2e/pages.spec.ts`

---

## Phase 5: US2 Asset Management (14 tasks)

**User Story**: As a content manager, I want to upload and manage media assets so that I can use images/videos in my website content.

- [X] T051 [P1] [US2] Define Asset data model and Zod schema at `src/features/assets/types.ts`
- [X] T052 [P1] [US2] Create client-side file validation (type, size, dimensions) at `src/features/assets/validation.ts`
- [X] T053 [P1] [US2] Create `useAssets` query hook with site filtering at `src/features/assets/hooks/useAssets.ts`
- [X] T054 [P1] [US2] Create `useUploadAsset` mutation hook with progress tracking at `src/features/assets/hooks/useUploadAsset.ts`
- [X] T055 [P1] [US2] Create `useDeleteAsset` mutation hook with confirmation at `src/features/assets/hooks/useDeleteAsset.ts`
- [X] T056 [P1] [US2] Build FileUpload component with drag-and-drop at `src/features/assets/components/FileUpload.tsx`
- [X] T057 [P1] [US2] Add upload progress indicator to FileUpload at `src/features/assets/components/FileUpload.tsx`
- [X] T058 [P1] [US2] Add file validation errors display to FileUpload at `src/features/assets/components/FileUpload.tsx`
- [X] T059 [P1] [US2] Build AssetGrid component with thumbnails and metadata at `src/features/assets/components/AssetGrid.tsx`
- [X] T060 [P1] [US2] Build AssetPreviewModal with full-size view at `src/features/assets/components/AssetPreviewModal.tsx`
- [X] T061 [P1] [US2] Build AssetsPage with upload and grid view at `src/features/assets/pages/AssetsPage.tsx`
- [X] T062 [P1] [US2] Write unit tests for asset hooks in `src/features/assets/hooks/*.test.ts`
- [X] T063 [P1] [US2] Write component tests for FileUpload validation in `src/features/assets/components/FileUpload.test.tsx`
- [X] T064 [P1] [US2] Write E2E test for asset upload and deletion in `tests/e2e/assets.spec.ts`

---

## Phase 6: Polish & Quality Assurance (6 tasks)

- [X] T065 [P1] [Polish] Run accessibility audit with axe-core on all pages in `tests/a11y/audit.spec.ts`
- [X] T066 [P1] [Polish] Add loading skeletons for all list views in `src/components/Skeleton.tsx`
- [X] T067 [P1] [Polish] Implement keyboard shortcuts (Ctrl+S save, Esc close modals) at `src/hooks/useKeyboardShortcuts.ts`
- [X] T068 [P1] [Polish] Add comprehensive error messages for API failures at `src/utils/errorMessages.ts`
- [X] T069 [P1] [Polish] Run performance testing for <3s page load target in `tests/performance/lighthouse.spec.ts`
- [X] T070 [P1] [Polish] Create deployment checklist and environment setup guide at `docs/deployment.md`

---

## Completion Criteria

**Functional**:
- ✅ All 24 functional requirements implemented
- ✅ All 3 P1 user stories testable end-to-end
- ✅ Page publishing via simple isPublished boolean toggle
- ✅ No scheduled publishing or page-asset associations

**Technical**:
- ✅ TypeScript strict mode with no `any` types
- ✅ 80%+ test coverage (unit + integration)
- ✅ WCAG 2.1 Level AA compliance (axe-core)
- ✅ p95 page load time <3s (Lighthouse)
- ✅ All API calls with proper error handling

**Quality**:
- ✅ 90% first-time task completion rate in user testing
- ✅ All E2E tests passing in CI/CD pipeline
- ✅ Zero console errors in production build
- ✅ Responsive design (mobile/tablet/desktop)

---

## Dependencies & Risks

**No Backend Dependencies**: All features supported by existing API  
**Key Risk Mitigations**:
- Concurrent edit detection via lastModified field
- Client-side file validation before upload
- Optimistic updates with rollback on failure
- Comprehensive error boundaries

**Estimated Effort**: 60 tasks across 6 phases (down from 87 tasks - removed scheduled publishing and page-asset associations)
