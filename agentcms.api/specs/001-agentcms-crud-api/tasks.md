---
description: "Implementation tasks for AgentCMS CRUD API"
---

# Tasks: AgentCMS CRUD API

**Feature**: 001-agentcms-crud-api  
**Input**: Design documents from `specs/001-agentcms-crud-api/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/openapi.yaml, research.md, quickstart.md

**Tests**: Tests are NOT requested in the specification. Test tasks are excluded per requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create .NET 8 Web API project structure: Controllers/, Models/, Services/, Repositories/, Data/, Storage/, Middleware/ directories in agentcms.api/
- [ ] T002 Initialize .csproj with Entity Framework Core, SQL Server, Swashbuckle.AspNetCore packages in agentcms.api/agentcms.api.csproj
- [ ] T003 [P] Configure appsettings.json with ConnectionStrings.DefaultConnection and FileStorage sections in agentcms.api/appsettings.json
- [ ] T004 [P] Configure Program.cs with Kestrel, service registration, and middleware pipeline in agentcms.api/Program.cs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create AgentCmsContext : DbContext with DbSet<Site>, DbSet<Page>, DbSet<Asset> in agentcms.api/Data/AgentCmsContext.cs
- [ ] T006 [P] Configure Fluent API for Site entity (primary key, unique name index, max lengths) in agentcms.api/Data/AgentCmsContext.cs
- [ ] T007 [P] Configure Fluent API for Page entity (foreign key to Site, indexes on SiteId and (SiteId, PublishedDate)) in agentcms.api/Data/AgentCmsContext.cs
- [ ] T008 [P] Configure Fluent API for Asset entity (foreign key to Site, index on SiteId) in agentcms.api/Data/AgentCmsContext.cs
- [ ] T009 Create initial EF Core migration 'InitialCreate' using dotnet ef migrations add in agentcms.api/Data/Migrations/
- [ ] T010 Apply database migration to create AgentCMS database using dotnet ef database update
- [ ] T011 [P] Create IFileStore interface with SaveAsync, GetStreamAsync, DeleteAsync, ExistsAsync methods in agentcms.api/Storage/IFileStore.cs
- [ ] T012 [P] Implement LocalFileStore : IFileStore with GUID filename generation and configurable path in agentcms.api/Storage/LocalFileStore.cs
- [ ] T013 [P] Create RequestLoggingMiddleware with correlation ID (X-Request-ID) in agentcms.api/Middleware/RequestLoggingMiddleware.cs
- [ ] T014 [P] Create global exception handler middleware with error response format in agentcms.api/Middleware/ExceptionHandlerMiddleware.cs
- [ ] T015 Configure Swagger UI with OpenAPI specification in agentcms.api/Program.cs
- [ ] T016 Register IFileStore as scoped service in dependency injection container in agentcms.api/Program.cs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Manage Sites (Priority: P1) 🎯 MVP

**Goal**: Site owners can create, retrieve, update, list, and delete sites to establish multi-tenant content containers

**Independent Test**: Create a site via POST /v1/sites, verify unique ID returned, GET by ID to confirm retrieval, LIST all sites, UPDATE site, DELETE site (with no content)

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create Site entity model (Id, Name, Description) with navigation properties in agentcms.api/Models/Entities/Site.cs
- [ ] T018 [P] [US1] Create SiteDto, CreateSiteDto, UpdateSiteDto with Data Annotations validation in agentcms.api/Models/DTOs/SiteDto.cs
- [ ] T019 [P] [US1] Create ISiteRepository interface with AddAsync, GetByIdAsync, ListAsync, UpdateAsync, DeleteAsync, CountPagesAsync, CountAssetsAsync in agentcms.api/Repositories/ISiteRepository.cs
- [ ] T020 [US1] Implement SiteRepository with EF Core queries using AsNoTracking for reads in agentcms.api/Repositories/SiteRepository.cs
- [ ] T021 [P] [US1] Create ISiteService interface with CreateAsync, GetByIdAsync, ListAsync, UpdateAsync, DeleteAsync methods in agentcms.api/Services/ISiteService.cs
- [ ] T022 [US1] Implement SiteService with validation (Name required, unique, max 255), deletion guard (check for pages/assets), and DTO mapping in agentcms.api/Services/SiteService.cs
- [ ] T023 [US1] Create SitesController with POST, GET, GET (by ID), PUT, DELETE endpoints mapped to /v1/sites in agentcms.api/Controllers/SitesController.cs
- [ ] T024 [US1] Implement POST /v1/sites endpoint returning 201 with Location header and SiteDto in agentcms.api/Controllers/SitesController.cs
- [ ] T025 [US1] Implement GET /v1/sites endpoint returning 200 with array of SiteDto in agentcms.api/Controllers/SitesController.cs
- [ ] T026 [US1] Implement GET /v1/sites/{siteId} endpoint returning 200 or 204 (non-standard not found) in agentcms.api/Controllers/SitesController.cs
- [ ] T027 [US1] Implement PUT /v1/sites/{siteId} endpoint with validation and 200 or 204 response in agentcms.api/Controllers/SitesController.cs
- [ ] T028 [US1] Implement DELETE /v1/sites/{siteId} endpoint with deletion guard returning 400 if content exists in agentcms.api/Controllers/SitesController.cs
- [ ] T029 [US1] Register ISiteRepository and ISiteService in dependency injection container in agentcms.api/Program.cs

**Checkpoint**: User Story 1 complete - Sites CRUD fully functional and testable independently

---

## Phase 4: User Story 2 - Manage Pages with Lifecycle States (Priority: P1)

**Goal**: Content editors can create, edit, preview, and publish pages within a site with draft/published lifecycle

**Independent Test**: Create draft page (isPublished=false) via POST, verify PublishedDate is null, update to publish (isPublished=true), confirm PublishedDate populated, filter pages by isPublished

### Implementation for User Story 2

- [ ] T030 [P] [US2] Create Page entity model (Id, SiteId, Title, Body, CreatedDate, UpdatedDate, PublishedDate, CreatedBy, UpdatedBy) in agentcms.api/Models/Entities/Page.cs
- [ ] T031 [P] [US2] Create PageDto, CreatePageDto, UpdatePageDto with IsPublished boolean mapping to PublishedDate in agentcms.api/Models/DTOs/PageDto.cs
- [ ] T032 [P] [US2] Create IPageRepository interface with AddAsync, GetByIdAsync, ListBySiteAsync, UpdateAsync, DeleteAsync methods in agentcms.api/Repositories/IPageRepository.cs
- [ ] T033 [US2] Implement PageRepository with tenant isolation filtering (all queries MUST include SiteId check) in agentcms.api/Repositories/PageRepository.cs
- [ ] T034 [P] [US2] Create IPageService interface with CreateAsync, GetByIdAsync, ListAsync, UpdateAsync, DeleteAsync accepting siteId parameter in agentcms.api/Services/IPageService.cs
- [ ] T035 [US2] Implement PageService with validation (Title required max 255), IsPublished → PublishedDate mapping, and timestamp management in agentcms.api/Services/PageService.cs
- [ ] T036 [US2] Implement CreatedDate/UpdatedDate auto-population (DateTime.UtcNow) in PageService.CreateAsync and UpdateAsync in agentcms.api/Services/PageService.cs
- [ ] T037 [US2] Implement PublishedDate logic: IsPublished=true sets DateTime.UtcNow, IsPublished=false sets null in agentcms.api/Services/PageService.cs
- [ ] T038 [US2] Create PagesController with POST, GET, GET (by ID), PUT, DELETE endpoints mapped to /v1/sites/{siteId}/pages in agentcms.api/Controllers/PagesController.cs
- [ ] T039 [US2] Implement POST /v1/sites/{siteId}/pages endpoint returning 201 with Location header and PageDto in agentcms.api/Controllers/PagesController.cs
- [ ] T040 [US2] Implement GET /v1/sites/{siteId}/pages endpoint with optional isPublished query parameter filtering in agentcms.api/Controllers/PagesController.cs
- [ ] T041 [US2] Implement GET /v1/sites/{siteId}/pages/{pageId} endpoint with tenant isolation (204 if wrong site) in agentcms.api/Controllers/PagesController.cs
- [ ] T042 [US2] Implement PUT /v1/sites/{siteId}/pages/{pageId} endpoint with publish/unpublish support in agentcms.api/Controllers/PagesController.cs
- [ ] T043 [US2] Implement DELETE /v1/sites/{siteId}/pages/{pageId} endpoint with tenant isolation check in agentcms.api/Controllers/PagesController.cs
- [ ] T044 [US2] Register IPageRepository and IPageService in dependency injection container in agentcms.api/Program.cs

**Checkpoint**: User Story 2 complete - Page CRUD with lifecycle fully functional, tenant-isolated, and testable independently

---

## Phase 5: User Story 4 - Enforce Tenant Isolation (Priority: P1)

**Goal**: Ensure all content operations respect site boundaries with zero cross-tenant data leakage

**Independent Test**: Create pages/assets in Site A and Site B, query each via their respective siteId routes, verify no cross-contamination, attempt to access Site A page via Site B route and confirm 204 response

### Implementation for User Story 4

- [ ] T045 [P] [US4] Add tenant isolation validation in PageRepository: all GetByIdAsync calls MUST filter by SiteId in agentcms.api/Repositories/PageRepository.cs
- [ ] T046 [P] [US4] Add tenant isolation validation in AssetRepository: all GetByIdAsync calls MUST filter by SiteId (to be created in US3) in agentcms.api/Repositories/AssetRepository.cs
- [ ] T047 [P] [US4] Add tenant isolation enforcement in PageService.GetByIdAsync: return null if page.SiteId != requested siteId in agentcms.api/Services/PageService.cs
- [ ] T048 [P] [US4] Add tenant isolation enforcement in AssetService.GetByIdAsync: return null if asset.SiteId != requested siteId (to be created in US3) in agentcms.api/Services/AssetService.cs
- [ ] T049 [US4] Add WHERE SiteId = @siteId clause to PageRepository.ListBySiteAsync query in agentcms.api/Repositories/PageRepository.cs
- [ ] T050 [US4] Add WHERE SiteId = @siteId clause to AssetRepository.ListBySiteAsync query (to be created in US3) in agentcms.api/Repositories/AssetRepository.cs
- [ ] T051 [US4] Verify PagesController GET/PUT/DELETE endpoints pass siteId from route to service layer in agentcms.api/Controllers/PagesController.cs
- [ ] T052 [US4] Verify AssetsController GET/PUT/DELETE endpoints pass siteId from route to service layer (to be created in US3) in agentcms.api/Controllers/AssetsController.cs

**Checkpoint**: User Story 4 complete - Tenant isolation enforced at repository and service layers, cross-tenant access blocked

---

## Phase 6: User Story 3 - Upload and Manage Assets (Priority: P2)

**Goal**: Developers/content managers upload media files and receive usable URLs, or provide external URLs for asset records

**Independent Test**: Upload JPEG via POST /v1/sites/{siteId}/assets (multipart), verify AssetDto with URL returned, GET asset by ID, download via /file endpoint, create asset from external URL, list assets for site

### Implementation for User Story 3

- [ ] T053 [P] [US3] Create Asset entity model (Id, SiteId, Filename, MimeType, Url, CreatedDate, CreatedBy) in agentcms.api/Models/Entities/Asset.cs
- [ ] T054 [P] [US3] Create AssetDto, CreateAssetDto (IFormFile), CreateAssetFromUrlDto with validation in agentcms.api/Models/DTOs/AssetDto.cs
- [ ] T055 [P] [US3] Create IAssetRepository interface with AddAsync, GetByIdAsync, ListBySiteAsync, DeleteAsync methods in agentcms.api/Repositories/IAssetRepository.cs
- [ ] T056 [US3] Implement AssetRepository with tenant isolation filtering (SiteId checks) in agentcms.api/Repositories/AssetRepository.cs
- [ ] T057 [P] [US3] Create IAssetService interface with UploadAsync, CreateFromUrlAsync, GetByIdAsync, ListAsync, DeleteAsync, DownloadAsync methods in agentcms.api/Services/IAssetService.cs
- [ ] T058 [US3] Implement AssetService.UploadAsync with MIME validation (image/jpeg, image/png, application/pdf only) in agentcms.api/Services/AssetService.cs
- [ ] T059 [US3] Implement file size validation (30 MB max) in AssetService.UploadAsync throwing ValidationException if exceeded in agentcms.api/Services/AssetService.cs
- [ ] T060 [US3] Implement GUID filename generation and IFileStore.SaveAsync call in AssetService.UploadAsync in agentcms.api/Services/AssetService.cs
- [ ] T061 [US3] Implement URL generation logic: {baseUrl}/v1/sites/{siteId}/assets/{assetId}/file in AssetService.UploadAsync in agentcms.api/Services/AssetService.cs
- [ ] T062 [US3] Implement AssetService.CreateFromUrlAsync for client-provided URLs (no local storage) in agentcms.api/Services/AssetService.cs
- [ ] T063 [US3] Implement AssetService.DownloadAsync calling IFileStore.GetStreamAsync with error handling for missing files in agentcms.api/Services/AssetService.cs
- [ ] T064 [US3] Implement AssetService.DeleteAsync with IFileStore.DeleteAsync call (delete file + record) in agentcms.api/Services/AssetService.cs
- [ ] T065 [US3] Create AssetsController with POST (multipart), POST /url (JSON), GET, GET (by ID), DELETE, GET /file endpoints in agentcms.api/Controllers/AssetsController.cs
- [ ] T066 [US3] Implement POST /v1/sites/{siteId}/assets endpoint accepting multipart/form-data with IFormFile in agentcms.api/Controllers/AssetsController.cs
- [ ] T067 [US3] Implement POST /v1/sites/{siteId}/assets/url endpoint accepting JSON with url, filename, mimeType in agentcms.api/Controllers/AssetsController.cs
- [ ] T068 [US3] Implement GET /v1/sites/{siteId}/assets endpoint returning array of AssetDto in agentcms.api/Controllers/AssetsController.cs
- [ ] T069 [US3] Implement GET /v1/sites/{siteId}/assets/{assetId} endpoint with tenant isolation in agentcms.api/Controllers/AssetsController.cs
- [ ] T070 [US3] Implement GET /v1/sites/{siteId}/assets/{assetId}/file endpoint streaming file with Content-Type header in agentcms.api/Controllers/AssetsController.cs
- [ ] T071 [US3] Implement DELETE /v1/sites/{siteId}/assets/{assetId} endpoint with file deletion in agentcms.api/Controllers/AssetsController.cs
- [ ] T072 [US3] Register IAssetRepository and IAssetService in dependency injection container in agentcms.api/Program.cs
- [ ] T073 [US3] Configure multipart request size limit (30 MB) in Program.cs or web.config in agentcms.api/Program.cs

**Checkpoint**: User Story 3 complete - Asset upload/download fully functional with MIME/size validation and tenant isolation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T074 [P] Add XML documentation comments to all public APIs (controllers, services, repositories) for Swagger UI
- [ ] T075 [P] Configure file logging with rolling interval (daily) in appsettings.json Logging section
- [ ] T076 [P] Add ModelState validation error mapping to ErrorResponse format in ExceptionHandlerMiddleware in agentcms.api/Middleware/ExceptionHandlerMiddleware.cs
- [ ] T077 [P] Create health check endpoint GET /health returning 200 OK with basic status in agentcms.api/Controllers/HealthController.cs
- [ ] T078 [P] Add CORS policy configuration for localhost origins (future frontend integration) in agentcms.api/Program.cs
- [ ] T079 Add Site deletion guard validation: throw ValidationException with message if pages/assets exist in agentcms.api/Services/SiteService.cs
- [ ] T080 [P] Verify all controller actions return correct status codes per OpenAPI spec (201 with Location, 200, 204, 400, 500)
- [ ] T081 [P] Verify all timestamps use DateTime.UtcNow and serialize as ISO 8601 in JSON
- [ ] T082 [P] Add Data Annotations validation attributes to all DTOs ([Required], [MaxLength]) in agentcms.api/Models/DTOs/
- [ ] T083 Run through quickstart.md scenarios manually to validate end-to-end workflows
- [ ] T084 [P] Document non-standard 204 behavior in Swagger API description and controller XML comments
- [ ] T085 [P] Create file upload directory C:\AgentCMS\uploads and set permissions if not exists during first run

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Tasks T001-T004 can all run in parallel (different files)
  
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - T005 must complete before T006, T007, T008 (DbContext needed for Fluent API)
  - T006, T007, T008 can run in parallel (different entity configurations)
  - T009 depends on T005-T008 (migration needs complete context)
  - T010 depends on T009 (apply migration)
  - T011, T012, T013, T014, T015, T016 can run in parallel (independent files)
  
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - After Phase 2, User Stories 1, 2, 4 can proceed in parallel (different entities)
  - User Story 3 should complete after User Story 4 (needs tenant isolation patterns established)
  
- **Polish (Phase 7)**: Depends on all desired user stories being complete
  - Most tasks marked [P] can run in parallel (different concerns)

### User Story Dependencies

- **User Story 1 (Sites - P1)**: Independent after Phase 2
  - No dependencies on other user stories
  - Provides Site entity needed by other stories
  
- **User Story 2 (Pages - P1)**: Independent after Phase 2
  - Depends on Site entity existence (from US1 or foundational)
  - Can implement in parallel with US1 if Site entity created in Phase 2
  
- **User Story 4 (Tenant Isolation - P1)**: Enhances US1 and US2
  - Adds validation to existing repositories/services
  - Can implement after US1 and US2 controllers exist
  - Or implement inline during US1/US2 development
  
- **User Story 3 (Assets - P2)**: Independent after Phase 2
  - Depends on Site entity and IFileStore abstraction (Phase 2)
  - Can implement in parallel with US1/US2 if staffed separately
  - Benefits from tenant isolation patterns from US4

### Within Each User Story

Standard flow per user story:
1. Entity models (can run in parallel)
2. DTOs (can run in parallel with entities)
3. Repository interface + implementation (repo after interface)
4. Service interface + implementation (service after repo, can parallelize interface)
5. Controller endpoints (after service, individual endpoints can parallelize)
6. DI registration (after all interfaces/implementations)

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- All 4 tasks can run in parallel

**Foundational Phase (Phase 2)**:
- T006, T007, T008 (Fluent API configs)
- T011, T012, T013, T014, T015, T016 (independent infrastructure)

**User Story 1 (Phase 3)**:
- T017, T018, T019 (entity, DTOs, interface)
- T024, T025, T026, T027, T028 (individual controller endpoints)

**User Story 2 (Phase 4)**:
- T030, T031, T032 (entity, DTOs, interface)
- T039, T040, T041, T042, T043 (individual controller endpoints)

**User Story 4 (Phase 5)**:
- All validation tasks T045, T046, T047, T048 can run in parallel

**User Story 3 (Phase 6)**:
- T053, T054, T055 (entity, DTOs, interface)
- T066, T067, T068, T069, T070, T071 (individual controller endpoints)

**Polish (Phase 7)**:
- Most tasks are independent and can run in parallel

---

## Parallel Execution Example: User Story 1

**Goal**: Minimize User Story 1 completion time with 3 developers

### Wave 1 (Parallel - 3 developers)
```bash
Dev1: T017 - Create Site entity
Dev2: T018 - Create SiteDto classes  
Dev3: T019 - Create ISiteRepository interface
```

### Wave 2 (Parallel - 3 developers)
```bash
Dev1: T020 - Implement SiteRepository
Dev2: T021 - Create ISiteService interface
Dev3: (wait for T020 or start documentation)
```

### Wave 3 (Parallel - 3 developers)
```bash
Dev1: T022 - Implement SiteService (after T020)
Dev2: T023 - Create SitesController skeleton
Dev3: (wait or assist with tests/docs)
```

### Wave 4 (Parallel - 5 endpoints)
```bash
Dev1: T024 - POST endpoint
Dev2: T025 - GET list endpoint
Dev3: T026 - GET by ID endpoint
(Dev1 continues): T027 - PUT endpoint
(Dev2 continues): T028 - DELETE endpoint
```

### Wave 5 (Sequential)
```bash
Any Dev: T029 - DI registration
```

**Total estimated time with 3 devs**: ~4-6 hours (vs ~12-16 hours sequential)

---

## MVP Scope Recommendation

**Minimum Viable Product**: User Story 1 only (Sites CRUD)

**Rationale**: Sites are the foundational tenant container. Completing US1 validates:
- Database connectivity and migrations
- Repository pattern implementation
- Service layer validation
- Controller routing and status codes
- DTO mapping
- Swagger documentation

**MVP Deliverable**: Fully functional Sites API that can be deployed and tested independently.

**Incremental Delivery Path**:
1. **MVP**: US1 (Sites) - ~2-3 days
2. **v1.1**: US1 + US2 (Sites + Pages) - +2-3 days
3. **v1.2**: US1 + US2 + US4 (Add tenant isolation hardening) - +1 day
4. **v2.0**: US1 + US2 + US4 + US3 (Full CMS with assets) - +2-3 days

---

## Task Completion Tracking

**Total Tasks**: 85  
**Parallel Tasks**: 34 (40% can run in parallel with sufficient team capacity)

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 12 tasks (CRITICAL PATH - blocks all user stories)
- Phase 3 (User Story 1): 13 tasks
- Phase 4 (User Story 2): 15 tasks
- Phase 5 (User Story 4): 8 tasks
- Phase 6 (User Story 3): 21 tasks
- Phase 7 (Polish): 12 tasks

**By User Story**:
- US1 (Sites): 13 tasks - ~2-3 days
- US2 (Pages): 15 tasks - ~2-3 days
- US3 (Assets): 21 tasks - ~3-4 days
- US4 (Tenant Isolation): 8 tasks - ~1 day

**Critical Path**: Phase 1 → Phase 2 → US1 (Sites) = ~5-7 days total

---

## Implementation Strategy

### Recommended Approach: Incremental by Priority

1. **Week 1**: Setup + Foundational + User Story 1 (Sites)
   - Delivers working API with basic CRUD
   - Validates architecture and patterns
   - Provides foundation for remaining stories

2. **Week 2**: User Story 2 (Pages) + User Story 4 (Tenant Isolation)
   - Adds core CMS functionality
   - Hardens multi-tenancy
   - Delivers publishable content system

3. **Week 3**: User Story 3 (Assets) + Polish
   - Adds media management
   - Cross-cutting improvements
   - Full feature completion

### Alternative: Parallel Teams

If 2+ developers available:
- **Team A**: Setup + Foundational + US1 (Sites)
- **Team B**: Wait for Foundational, then start US2 (Pages) in parallel with US1
- **Both**: Converge on US4 (Tenant Isolation) after US1/US2
- **Team A**: US3 (Assets) while Team B does Polish

**Benefit**: ~30% time savings through parallelization

---

**Next Action**: Begin Phase 1 (Setup) - estimated 2-4 hours
