# Implementation Plan: AgentCMS CRUD API

**Branch**: `001-agentcms-crud-api` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-agentcms-crud-api/spec.md`

**Status**: ✅ **DESIGN COMPLETE** (Ready for Phase 2 - Task Breakdown)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a RESTful, implementation-agnostic API to store, retrieve, update, and delete CMS content (Sites, Pages, Assets) with multi-tenant isolation via site-scoped routes, publish workflow support (draft/published states), and pluggable file storage abstraction for assets.

**Key Design Decisions**:
- .NET 8 + ASP.NET Core (Kestrel) for local API hosting
- Entity Framework Core (code-first) with SQL Server Express
- Repository + Service layer pattern for testability and abstraction
- IFileStore abstraction for swappable storage (local → Azure Blob)
- URL versioning (/v1) with documented deprecation policy
- Non-standard 204 status for "not found" (per spec requirement)

## Technical Context

**Language/Version**: .NET 8 (C#)  
**Primary Dependencies**: ASP.NET Core (Kestrel), Entity Framework Core (or ADO.NET), SQL Server Express (local)  
**Storage**: SQL Server Express (local instance) for structured data; Local filesystem (configurable directory, GUID filenames) for asset files  
**Testing**: xUnit (inferred .NET standard), integration tests for validation/persistence/file storage  
**Target Platform**: Windows workstation (local development, Kestrel host)  
**Project Type**: Web API (single backend project)  
**Performance Goals**: <500ms for create operations, <2s for list operations under 100 sites × 1000 pages  
**Constraints**: Anonymous read/write access (no auth), local-only deployment, 30MB max asset size, MIME type validation (image/jpeg, image/png, application/pdf)  
**Scale/Scope**: 100 sites × 1000 pages per site, local workstation hosting

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Assessment

| Constitution Requirement | Spec Compliance | Status | Notes |
|-------------------------|-----------------|--------|-------|
| **API-First, Contract-Driven** | ✅ Partial | ⚠️ ACTION | RESTful JSON API specified; OpenAPI/Swagger documentation MUST be added |
| **Secure, Multi-Tenant by Default** | ❌ VIOLATION | ⚠️ GATE | Anonymous access specified (no API key auth); Tenant isolation via `siteId` is present |
| **Content Modeling + Lifecycle** | ✅ Full | ✅ PASS | Fixed schema (Page: Title/Body); Draft (null PublishedDate) / Published (populated PublishedDate) states supported |
| **Queryable Delivery Experience** | ✅ Full | ✅ PASS | List/filter by site, pagination not explicitly required but list endpoints present; stable IDs (GUID) |
| **Integrations + Auditability** | ✅ Partial | ⚠️ ACTION | Asset upload/retrieval supported; API versioning (/v1) present; No deprecation policy yet |

### Gates & Violations

**GATE FAILURE: Security** (Constitution §2: Secure, Multi-Tenant by Default)
- **Violation**: Spec explicitly states "anonymous read/write allowed" with no authentication provider.
- **Constitution Requirement**: "MUST authenticate every non-public request via API key"
- **Justification**: This is a **local development API** running on a single workstation with no external exposure. The spec explicitly notes this as a known risk ("anonymous write access means unsafe inputs and accidental deletions—mitigate by keeping deployment local"). The design includes abstraction boundaries (FileStore, repository) to add auth later with minimal changes.
- **Mitigation Plan**: 
  1. Design controllers/middleware with clear auth extension points (attribute-based or middleware injection)
  2. Document in quickstart.md: "WARNING: No authentication - local use only"
  3. Plan for API key auth in future iteration (Phase 2 or later)
- **Decision**: **PROCEED WITH JUSTIFICATION** - violation is acknowledged and acceptable for MVP scope (local dev only).

**ACTION REQUIRED: OpenAPI Documentation**
- Constitution requires OpenAPI spec kept in sync.
- **Resolution**: Generate OpenAPI contract in Phase 1 (contracts/ directory).

**ACTION REQUIRED: API Versioning Policy**
- Constitution requires version + deprecation policy.
- **Resolution**: URL versioning (/v1) already specified; add deprecation policy to contracts/README.md in Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/001-agentcms-crud-api/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - technology decisions & patterns
├── data-model.md        # Phase 1 output - entity schemas, validation rules, relationships
├── quickstart.md        # Phase 1 output - developer setup guide
├── contracts/           # Phase 1 output - OpenAPI specs, API versioning policy
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
agentcms.api/                    # Root .NET project (existing workspace)
├── Controllers/                 # RESTful API controllers (Sites, Pages, Assets)
│   ├── SitesController.cs
│   ├── PagesController.cs
│   └── AssetsController.cs
├── Models/                      # Domain entities + DTOs
│   ├── Entities/
│   │   ├── Site.cs
│   │   ├── Page.cs
│   │   └── Asset.cs
│   └── DTOs/
│       ├── SiteDto.cs
│       ├── PageDto.cs
│       └── AssetDto.cs
├── Services/                    # Business logic, validation, audit, lifecycle management
│   ├── ISiteService.cs
│   ├── SiteService.cs
│   ├── IPageService.cs
│   ├── PageService.cs
│   ├── IAssetService.cs
│   └── AssetService.cs
├── Repositories/                # Data access layer (EF Core or ADO.NET)
│   ├── ISiteRepository.cs
│   ├── SiteRepository.cs
│   ├── IPageRepository.cs
│   ├── PageRepository.cs
│   ├── IAssetRepository.cs
│   └── AssetRepository.cs
├── Data/                        # EF Core DbContext, migrations (if using EF)
│   ├── AgentCmsContext.cs
│   └── Migrations/
├── Storage/                     # File storage abstraction + local provider
│   ├── IFileStore.cs
│   ├── LocalFileStore.cs
│   └── (future: AzureBlobStore.cs)
├── Middleware/                  # Logging, exception handling, future auth
│   └── RequestLoggingMiddleware.cs
├── appsettings.json             # Configuration (SQL connection string, file storage path)
├── Program.cs                   # Kestrel host, service registration, middleware pipeline
└── agentcms.api.csproj

tests/                           # Test project(s)
├── AgentCms.Api.Tests/
│   ├── Unit/                    # Service/repository unit tests
│   ├── Integration/             # API endpoint integration tests
│   └── FileStore/               # File storage behavior tests
└── AgentCms.Api.Tests.csproj
```

**Structure Decision**: Single web API project structure (ASP.NET Core standard layout). Controllers route to services (business logic + validation) → repositories (data access) → SQL Server Express. File operations delegated to IFileStore abstraction with local filesystem implementation. Testing separated into distinct unit/integration/storage test suites.

## Post-Design Constitution Re-Check

**Date**: 2026-02-12 (after Phase 1 design completion)

### Design Artifacts Review

✅ **OpenAPI Specification**: Complete OpenAPI 3.0 spec generated at `contracts/openapi.yaml`
- All endpoints documented with schemas, parameters, responses
- Error response formats standardized
- MIME types and validation rules documented

✅ **Tenant Isolation**: Design enforces multi-tenant isolation
- Repository layer enforces `SiteId` filtering on all queries
- API routes are site-scoped (`/v1/sites/{siteId}/pages`)
- Service layer includes tenant validation

✅ **Content Lifecycle**: Publish workflow fully designed
- Draft state: `PublishedDate == null`
- Published state: `PublishedDate != null`
- DTO mapping (`IsPublished` boolean ↔ `PublishedDate` timestamp) documented

✅ **Queryable Delivery**: Read access patterns defined
- List endpoints with filtering (`isPublished` query param)
- Stable identifiers (GUID primary keys)
- Pagination roadmap documented (future v1.x enhancement)

✅ **Asset Management**: Complete upload/download flow
- Multipart upload with local storage
- Client-provided URL support
- File download streaming endpoint

### Remaining Violations (Justified)

**Authentication Requirement (Constitution §2)**
- **Status**: VIOLATION PERSISTS (by design)
- **Justification**: Local development MVP only; explicit spec requirement "no authentication provider required at this stage"
- **Mitigation**:
  - OpenAPI contract includes placeholder for `Authorization` header (future)
  - Service layer accepts `CreatedBy`/`UpdatedBy` parameters (auth integration points)
  - Documented in quickstart.md: "⚠️ WARNING: No authentication - local use only"
- **Acceptance**: APPROVED for v1 (local dev only); MUST add in v2

### Design Quality Assessment

| Criterion | Status | Evidence |
|-----------|--------|----------|
| API Contract Documented | ✅ | OpenAPI 3.0 spec complete |
| Versioning Strategy | ✅ | URL-based /v1, deprecation policy documented |
| Tenant Isolation | ✅ | Repository + route-level enforcement |
| Content Lifecycle | ✅ | Draft/published states with PublishedDate |
| Queryable Endpoints | ✅ | List + filter + stable IDs |
| Asset Management | ✅ | Upload + download + URL support |
| Error Standards | ✅ | Consistent error response format |
| Test Strategy | ✅ | Unit/integration/contract test plan in data-model.md |

**Conclusion**: Design meets all constitution requirements except authentication (justified deviation for v1).

---

## Phase 2 Planning (Next Steps)

**Command**: `/speckit.tasks` (not executed by `/speckit.plan`)

Phase 2 will break down the implementation into concrete tasks:
1. Database schema + EF migrations
2. Entity models and DTOs
3. Repository implementations
4. Service layer (validation, business logic)
5. File storage abstraction + local provider
6. API controllers (Sites, Pages, Assets)
7. Middleware (logging, exception handling)
8. Unit tests (repositories, services)
9. Integration tests (API endpoints)
10. Documentation (Swagger configuration)

**Estimated Effort**: 5-7 days for full implementation + testing

---

## Generated Artifacts

All Phase 0 and Phase 1 deliverables have been completed:

### Phase 0: Research & Decisions
- ✅ **[research.md](research.md)**: Technology decisions, architecture patterns, best practices
  - .NET 8 + Kestrel rationale
  - EF Core vs ADO.NET comparison
  - URL versioning strategy
  - File storage abstraction design
  - Service layer responsibilities
  - Repository pattern justification
  - Validation strategy
  - Error handling conventions
  - Logging approach
  - Security considerations (10 research decisions documented)

### Phase 1: Design & Contracts
- ✅ **[data-model.md](data-model.md)**: Complete entity definitions, validation rules, relationships
  - Entity relationship diagram
  - Site, Page, Asset schemas with C# models + EF configuration
  - DTO definitions (Create/Update/Response DTOs)
  - State machine diagrams (Page lifecycle)
  - Validation matrix
  - Database schema SQL
  - Query examples with tenant isolation
  - Performance indexing strategy
  - Security considerations
  - Testing strategy

- ✅ **[contracts/openapi.yaml](contracts/openapi.yaml)**: OpenAPI 3.0 specification
  - All endpoints documented (Sites, Pages, Assets)
  - Request/response schemas
  - Error response formats
  - Multipart upload specification
  - File download streaming
  - Query parameters (filtering)
  - Non-standard 204 behavior documented

- ✅ **[contracts/README.md](contracts/README.md)**: API versioning policy
  - URL versioning strategy (/v1)
  - Breaking vs non-breaking change definitions
  - Deprecation process (6-month support window)
  - Status code semantics
  - Error response format
  - Pagination roadmap (future v2)
  - Changelog (v1.0.0 initial release)

- ✅ **[quickstart.md](quickstart.md)**: Developer setup guide
  - Prerequisites (.NET 8, SQL Server Express)
  - Setup instructions (database, file storage, configuration)
  - Basic usage with PowerShell examples
  - Common workflows (create site + page, draft → publish, upload assets)
  - Validation rules reference
  - Error handling examples
  - Troubleshooting guide
  - Development tips (hot reload, logging, testing)

- ✅ **[.github/copilot-instructions.md](../../.github/copilot-instructions.md)**: Agent context
  - Project overview and technology stack
  - Architecture patterns (layered, abstractions, multi-tenancy)
  - Entity model reference
  - Validation rules
  - Code conventions (naming, async/await, EF patterns)
  - Common operations with code examples
  - Configuration references
  - Documentation links

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No API key authentication | Local development MVP with anonymous access | Adding auth now would delay MVP delivery; spec explicitly states "no authentication provider required at this stage"; design includes clear extension points (middleware, attributes) for future auth with minimal refactor |
