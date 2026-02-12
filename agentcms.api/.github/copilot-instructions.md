# GitHub Copilot Instructions - AgentCMS

This file provides context to GitHub Copilot for the AgentCMS project.

## Project Overview

AgentCMS is a RESTful headless CMS API for managing multi-tenant content (Sites, Pages, Assets) with site-scoped isolation.

## Technology Stack

### Runtime & Framework
- **.NET 8**: LTS version with modern C# features
- **ASP.NET Core**: Web API framework with Kestrel web server
- **Entity Framework Core**: Code-first ORM for data access
- **Target Platform**: Windows workstation (local development)

### Data Storage
- **SQL Server Express**: Local database instance for structured data
- **Local Filesystem**: Configurable directory for asset file storage (GUID filenames)
- **Connection String Format**: `Server=localhost\\SQLEXPRESS;Database=AgentCMS;Trusted_Connection=True;TrustServerCertificate=True`

### Testing & Validation
- **xUnit**: Primary testing framework
- **Data Annotations**: DTO validation (`[Required]`, `[MaxLength]`)
- **Custom Validation**: Service layer for business rules (MIME types, file sizes)

### API Conventions
- **Versioning**: URL-based (`/v1/sites`, `/v1/sites/{siteId}/pages`)
- **Serialization**: System.Text.Json (built-in .NET 8)
- **Documentation**: OpenAPI/Swagger (Swashbuckle.AspNetCore)
- **Status Codes**: 201 (Created with Location), 200 (OK), 204 (Not Found - non-standard), 400 (Validation), 500 (Error)

## Architecture Patterns

### Layered Architecture
```
Controllers (HTTP routing, DTOs)
    ↓
Services (validation, business logic, audit fields)
    ↓
Repositories (data access, EF queries)
    ↓
EF DbContext (persistence)
```

### Key Abstractions
- **IFileStore**: Storage abstraction for asset files
  - Current: `LocalFileStore` (filesystem)
  - Future: `AzureBlobStore` (cloud storage)
- **Repository Pattern**: `ISiteRepository`, `IPageRepository`, `IAssetRepository`
- **Service Layer**: `ISiteService`, `IPageService`, `IAssetService`

### Multi-Tenancy
- **Tenant Isolation**: All queries MUST filter by `SiteId`
- **Route Pattern**: `/v1/sites/{siteId}/pages` (site-scoped routes)
- **Foreign Keys**: Pages and Assets belong to exactly one Site

## Entity Model

### Site
- **Primary Key**: `Id` (GUID)
- **Fields**: `Name` (required, unique, max 255), `Description` (optional, max 255)
- **Relationships**: One-to-many with Pages and Assets
- **Deletion Guard**: Cannot delete if has content (service layer enforcement)

### Page
- **Primary Key**: `Id` (GUID)
- **Foreign Key**: `SiteId` (required)
- **Fields**: `Title` (required, max 255), `Body` (VARCHAR(MAX)), `CreatedDate`, `UpdatedDate`, `PublishedDate`, `CreatedBy`, `UpdatedBy`
- **Lifecycle**: Draft (`PublishedDate == null`), Published (`PublishedDate != null`)
- **Indexes**: `(SiteId)`, `(SiteId, PublishedDate)`

### Asset
- **Primary Key**: `Id` (GUID)
- **Foreign Key**: `SiteId` (required)
- **Fields**: `Filename` (max 255), `MimeType` (max 100), `Url` (max 500), `CreatedDate`, `CreatedBy`
- **Validation**: MIME whitelist (image/jpeg, image/png, application/pdf), 30 MB max size
- **Storage**: GUID filename server-side (prevents path traversal)

## Validation Rules

### Sites
- Name: Required, max 255 chars, unique
- Description: Optional, max 255 chars

### Pages
- Title: Required, max 255 chars
- Body: Optional, unlimited (VARCHAR(MAX))
- IsPublished (DTO): Maps to PublishedDate (true = DateTime.UtcNow, false = null)

### Assets
- File size: 30 MB maximum
- MIME types: `image/jpeg`, `image/png`, `application/pdf` only
- Filename: Generated server-side (GUID) to prevent path traversal

## Code Conventions

### Naming
- **Entities**: Pascal case, singular (e.g., `Site`, `Page`, `Asset`)
- **DTOs**: Suffix with `Dto` (e.g., `SiteDto`, `CreatePageDto`, `UpdatePageDto`)
- **Interfaces**: Prefix with `I` (e.g., `ISiteService`, `IFileStore`)
- **Repository Methods**: `AddAsync`, `GetByIdAsync`, `ListAsync`, `UpdateAsync`, `DeleteAsync`

### Async/Await
- Always use async/await for I/O operations (DB, file storage)
- Methods return `Task<T>` or `Task`
- Use `CancellationToken` for long-running operations

### EF Core Queries
- Use `.AsNoTracking()` for read-only queries (performance)
- Always filter by `SiteId` for Pages/Assets (tenant isolation)
- Use `.SingleOrDefaultAsync()` for single results, `.ToListAsync()` for collections

### Error Handling
- Service layer throws `ValidationException` for business rule violations
- Controllers catch exceptions and return appropriate status codes
- Global exception handler for unhandled errors (500)

### Timestamps
- Server-controlled: `CreatedDate`, `UpdatedDate`, `PublishedDate`
- Always UTC: `DateTime.UtcNow`
- ISO 8601 format in JSON: `"2026-02-12T15:30:00Z"`

## Security Considerations

### Current (v1)
- **No Authentication**: Anonymous access (local development only)
- **Path Traversal Prevention**: GUID filenames, validate paths
- **SQL Injection Prevention**: Parameterized queries (EF default)
- **MIME Type Validation**: Whitelist + magic byte verification

### Future (v2+)
- API key authentication via `Authorization: Bearer {key}` header
- Rate limiting
- HTTPS enforcement (currently optional for local dev)

## Common Operations

### Create Page (Draft)
```csharp
var page = new Page
{
    Id = Guid.NewGuid(),
    SiteId = siteId,
    Title = dto.Title,
    Body = dto.Body,
    CreatedDate = DateTime.UtcNow,
    UpdatedDate = DateTime.UtcNow,
    PublishedDate = dto.IsPublished ? DateTime.UtcNow : null,
    CreatedBy = dto.CreatedBy,
    UpdatedBy = dto.CreatedBy
};
```

### Publish Page (Update)
```csharp
page.PublishedDate = DateTime.UtcNow;
page.UpdatedDate = DateTime.UtcNow;
page.UpdatedBy = dto.UpdatedBy;
```

### Tenant-Scoped Query
```csharp
var pages = await _context.Pages
    .AsNoTracking()
    .Where(p => p.SiteId == siteId && p.PublishedDate != null)
    .OrderByDescending(p => p.PublishedDate)
    .ToListAsync();
```

### File Upload Flow
```csharp
// 1. Validate MIME + size in service
// 2. Call IFileStore.SaveAsync(stream, filename, mimeType)
// 3. Create Asset entity with returned storage path
// 4. Return AssetDto with URL
```

## Known Deviations from Standards

### 204 Instead of 404
**Non-Standard**: API returns `204 No Content` when resources are not found, instead of `404 Not Found`.

**Rationale**: Specified in feature requirements. May change in v2.

**Impact**: Clients must check for 204 status code, not 404.

## Configuration Files

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=AgentCMS;..."
  },
  "FileStorage": {
    "Provider": "Local",
    "LocalPath": "C:\\AgentCMS\\uploads",
    "BaseUrl": "https://localhost:5001"
  }
}
```

### EF Migrations
```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

## Documentation References

- **Spec**: `specs/001-agentcms-crud-api/spec.md`
- **Plan**: `specs/001-agentcms-crud-api/plan.md`
- **Data Model**: `specs/001-agentcms-crud-api/data-model.md`
- **Research**: `specs/001-agentcms-crud-api/research.md`
- **API Contract**: `specs/001-agentcms-crud-api/contracts/openapi.yaml`
- **Quickstart**: `specs/001-agentcms-crud-api/quickstart.md`

---

**Last Updated**: 2026-02-12 | **Feature**: 001-agentcms-crud-api
