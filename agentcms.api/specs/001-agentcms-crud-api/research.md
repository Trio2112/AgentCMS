# Research & Technology Decisions

**Feature**: AgentCMS CRUD API  
**Date**: 2026-02-12  
**Phase**: 0 - Outline & Research

## Overview

This document captures research findings and technology decisions for implementing the AgentCMS CRUD API. All major architectural decisions were provided in the feature architecture overview; this research validates those choices and documents best practices.

## Research Tasks Completed

All technical context was explicitly provided in the architecture overview. No NEEDS CLARIFICATION items were present. This research validates and documents the rationale for the specified architecture.

---

## Decision 1: .NET 8 + Kestrel for Local API Hosting

**Context**: Need a lightweight HTTP API server for local Windows workstation development.

**Decision**: Use .NET 8 with Kestrel (built-in ASP.NET Core web server)

**Rationale**:
- Kestrel is production-grade, cross-platform, and requires zero external dependencies
- Built-in support for JSON serialization, routing, middleware pipeline
- Excellent local development experience (hot reload, detailed diagnostics)
- Native Windows support with no IIS dependency required
- Strong community and Microsoft support for .NET 8 LTS

**Alternatives Considered**:
- **Node.js + Express**: Rejected - spec explicitly requires .NET 8
- **ASP.NET Framework + IIS Express**: Rejected - heavier weight, legacy stack, requires IIS configuration
- **Standalone HTTP listener**: Rejected - reinvents Kestrel capabilities

**Implementation Notes**:
- Host configuration in `Program.cs` using minimal hosting model
- Listen on localhost:5000 (HTTP) or localhost:5001 (HTTPS) by default
- Configure via `appsettings.json` for flexibility

---

## Decision 2: Entity Framework Core vs ADO.NET for Data Access

**Context**: Need to persist Sites, Pages, Assets to SQL Server Express with foreign key relationships.

**Decision**: Use Entity Framework Core (Code-First approach)

**Rationale**:
- Native .NET 8 integration with excellent tooling (migrations, LINQ)
- Code-first migrations simplify schema evolution (add fields, update indexes)
- Strong typing and compile-time safety for queries
- Lazy/eager loading for relationships (Site → Pages/Assets)
- Minimal boilerplate compared to ADO.NET for CRUD operations

**Alternatives Considered**:
- **Plain ADO.NET (SqlConnection, SqlCommand)**: Rejected - excessive boilerplate for CRUD operations; manual SQL string management error-prone; no automatic migration support
- **Dapper (micro-ORM)**: Rejected - spec does not authorize additional libraries; still requires manual SQL; migrations not built-in

**Implementation Notes**:
- Define `AgentCmsContext : DbContext` with DbSets for Site, Page, Asset
- Use Fluent API for constraints (required fields, max lengths, foreign keys)
- Enable cascade delete for Site → Pages/Assets relationships
- Store connection string in `appsettings.json`: `Server=localhost\\SQLEXPRESS;Database=AgentCMS;Trusted_Connection=True`

**Migration Strategy**:
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## Decision 3: URL Versioning Strategy (/v1)

**Context**: API must support future evolution without breaking existing clients.

**Decision**: URL-based versioning (`/v1/sites/{siteId}/pages`)

**Rationale**:
- Explicit and visible in every request (easy debugging, logging)
- Clear separation of versions in routing logic
- No header inspection required (simpler client implementations)
- Standard practice for RESTful APIs (Stripe, GitHub, Twilio)

**Alternatives Considered**:
- **Header versioning (Accept: application/vnd.agentcms.v1+json)**: Rejected - less discoverable, requires header parsing middleware
- **Query string versioning (?api-version=1)**: Rejected - pollutes URLs, easy to forget in requests

**Deprecation Policy**:
- Support at least one previous major version (e.g., v1 + v2 simultaneously)
- Provide 6-month deprecation notice via API response headers (`X-Deprecated-Version: true`)
- Document breaking changes in `/contracts/CHANGELOG.md`

---

## Decision 4: File Storage Abstraction Design

**Context**: Asset files stored locally now, Azure Blob Storage later, without API changes.

**Decision**: Create `IFileStore` interface with `LocalFileStore` implementation

**Interface Design**:
```csharp
public interface IFileStore
{
    Task<string> SaveAsync(Stream fileStream, string filename, string mimeType, CancellationToken cancellationToken);
    Task<Stream> GetStreamAsync(string storagePath, CancellationToken cancellationToken);
    Task DeleteAsync(string storagePath, CancellationToken cancellationToken);
    Task<bool> ExistsAsync(string storagePath, CancellationToken cancellationToken);
}
```

**Rationale**:
- Controllers/services depend only on `IFileStore` (dependency inversion)
- `LocalFileStore` stores files as GUIDs in configurable directory (e.g., `C:\AgentCMS\uploads\`)
- Returns URL format: `https://localhost:5001/v1/sites/{siteId}/assets/{assetId}/file`
- Future `AzureBlobStore` can inject Azure Blob client, return blob URLs
- Configuration in `appsettings.json`:
  ```json
  "FileStorage": {
    "Provider": "Local",
    "LocalPath": "C:\\AgentCMS\\uploads",
    "BaseUrl": "https://localhost:5001"
  }
  ```

**Alternatives Considered**:
- **Direct filesystem calls in AssetService**: Rejected - tightly couples to local filesystem; no abstraction for cloud storage
- **Abstract IStorageProvider with multiple methods**: Rejected - `IFileStore` is clearer for file-specific operations

**Implementation Notes**:
- Generate GUID filename server-side (prevents collisions, path traversal attacks)
- Store original filename + GUID mapping in Asset table
- Validate MIME type before saving (whitelist: image/jpeg, image/png, application/pdf)
- Return 404 if file missing during download (log as error for investigation)

---

## Decision 5: Service Layer Responsibilities

**Context**: Controllers should be thin routing layers; business logic must be testable independently.

**Decision**: Implement service layer with validation, audit fields, and lifecycle management

**Service Responsibilities**:
1. **Validation**:
   - Required fields (Site.Name, Page.Title)
   - Max lengths (Name/Title/Description: 255 chars)
   - MIME type whitelist (assets)
   - File size limit (30 MB)

2. **Audit/Timestamp Management**:
   - Set `CreatedDate` on create (UTC now)
   - Set `UpdatedDate` on update (UTC now)
   - Map `IsPublished` DTO field to `PublishedDate` (null = draft, DateTime = published)
   - Set `CreatedBy`/`UpdatedBy` from request context (future auth integration point)

3. **Business Rules**:
   - **Site deletion guard**: Reject if Site has Pages or Assets (return 400 with error message)
   - **Tenant isolation enforcement**: Service methods accept `siteId` parameter; repositories filter all queries

4. **DTO Translation**:
   - Convert entity models (with EF navigation properties) to DTOs (flat, serializable)
   - Never expose EF entities directly in API responses (prevents lazy-loading issues)

**Pattern**:
```csharp
public interface IPageService
{
    Task<PageDto> CreateAsync(Guid siteId, CreatePageDto dto, string createdBy);
    Task<PageDto?> GetByIdAsync(Guid siteId, Guid pageId);
    Task<List<PageDto>> ListAsync(Guid siteId, bool? isPublished);
    Task<PageDto> UpdateAsync(Guid siteId, Guid pageId, UpdatePageDto dto, string updatedBy);
    Task DeleteAsync(Guid siteId, Guid pageId);
}
```

**Rationale**:
- Controllers become pure HTTP adapters (routing, status codes, content negotiation)
- Services are easily unit-testable (mock repositories)
- Centralized validation logic (DRY principle)
- Clear separation of concerns (routing vs business logic vs data access)

**Alternatives Considered**:
- **MediatR + CQRS handlers**: Rejected - adds complexity, spec does not authorize additional libraries
- **Fat controllers with inline validation**: Rejected - untestable business logic, violates SRP

---

## Decision 6: Repository Pattern vs Direct DbContext Injection

**Context**: Services need to persist/query entities; EF DbContext can be injected directly or wrapped.

**Decision**: Use Repository pattern with interfaces (`ISiteRepository`, etc.)

**Rationale**:
- **Testability**: Services can mock repositories without EF in-memory database
- **Abstraction**: If switching from EF to ADO.NET or different ORM, only repositories change
- **Query encapsulation**: Complex filtering logic (e.g., "list published pages for site") lives in repositories
- **Tenant isolation enforcement**: Repository methods enforce `siteId` filtering consistently

**Pattern**:
```csharp
public interface IPageRepository
{
    Task<Page> AddAsync(Page page);
    Task<Page?> GetByIdAsync(Guid siteId, Guid pageId); // enforces siteId filter
    Task<List<Page>> ListBySiteAsync(Guid siteId, bool? isPublished);
    Task UpdateAsync(Page page);
    Task DeleteAsync(Guid pageId);
    Task<int> CountBySiteAsync(Guid siteId);
}
```

**Alternatives Considered**:
- **Direct DbContext injection in services**: Rejected - harder to unit test; no abstraction for non-EF implementations
- **Generic repository (IRepository<T>)**: Rejected - loses domain-specific query methods; forces complex specifications pattern

**Implementation Notes**:
- Repositories inject `AgentCmsContext` directly
- All query methods include `.AsNoTracking()` for read operations (performance)
- Use `.SingleOrDefaultAsync()` for get-by-id, `.ToListAsync()` for lists

---

## Decision 7: Validation Strategy (Model Validation vs FluentValidation)

**Context**: Need to validate required fields, max lengths, MIME types, file sizes.

**Decision**: Use Data Annotations on DTOs + custom service-layer validation

**Rationale**:
- Data Annotations (e.g., `[Required]`, `[MaxLength(255)]`) integrated with ASP.NET Core model binding
- Automatic 400 Bad Request responses with `ModelState` errors
- Custom validation (MIME types, file sizes, business rules) in service layer
- No additional library required (FluentValidation not authorized by spec)

**Pattern**:
```csharp
public class CreatePageDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; }
    
    public string? Body { get; set; } // varchar(max), nullable
}
```

**Service Validation**:
```csharp
public async Task<AssetDto> UploadAsync(Guid siteId, IFormFile file, string createdBy)
{
    // Custom validation
    if (file.Length > 30 * 1024 * 1024)
        throw new ValidationException("File size exceeds 30 MB limit");
    
    var allowedTypes = new[] { "image/jpeg", "image/png", "application/pdf" };
    if (!allowedTypes.Contains(file.ContentType))
        throw new ValidationException($"MIME type {file.ContentType} not allowed");
    
    // ... proceed with storage
}
```

**Alternatives Considered**:
- **FluentValidation library**: Rejected - spec asks to avoid external libraries where possible; Data Annotations sufficient
- **No validation (rely on database constraints)**: Rejected - poor UX (database errors expose internal schema); no file-level validation

---

## Decision 8: Asset Upload Flow (Multipart vs Client-Provided URL)

**Context**: Spec allows both direct upload (multipart/form-data) and client-provided URL.

**Decision**: Implement two endpoints:
1. `POST /v1/sites/{siteId}/assets` (multipart file upload)
2. `POST /v1/sites/{siteId}/assets/url` (JSON body with URL)

**Multipart Upload Flow**:
1. Client sends `multipart/form-data` with file + metadata (CreatedBy)
2. Controller binds `IFormFile`, validates MIME + size
3. Service calls `IFileStore.SaveAsync()` → returns storage path
4. Service creates Asset record: `{ Filename, MimeType, Url: baseUrl/v1/sites/{siteId}/assets/{assetId}/file }`
5. Returns 201 with Location header + AssetDto

**Client-Provided URL Flow**:
1. Client sends `{ "Url": "https://example.com/image.jpg", "Filename": "image.jpg", "MimeType": "image/jpeg" }`
2. Service validates MIME type (no file size check possible)
3. Service creates Asset record with provided URL as-is
4. Returns 201 with AssetDto

**File Download Endpoint**:
- `GET /v1/sites/{siteId}/assets/{assetId}/file`
- Service resolves Asset → reads storage path → calls `IFileStore.GetStreamAsync()`
- Controller streams file with `Content-Type` header set to Asset.MimeType
- Returns 404 if asset not found or file missing

**Rationale**:
- Supports both use cases (spec is ambiguous, architecture overview clarifies both flows)
- Multipart upload stores locally; URL upload trusts client (no local copy)
- Download endpoint works for multipart-uploaded files only (URL-provided assets redirect or return URL in response)

---

## Decision 9: Error Handling & Status Codes

**Context**: Spec defines non-standard 204 for "not found" (typical is 404).

**Decision**: Follow spec exactly for MVP; document deviation

**Status Code Mapping**:
- **201 Created**: Successful create operations (Site/Page/Asset) with `Location` header
- **200 OK**: Successful GET, PUT, DELETE
- **204 No Content**: Resource not found (per spec requirement, deviates from REST standard)
- **400 Bad Request**: Validation errors, business rule violations (e.g., cannot delete non-empty Site)
- **500 Internal Server Error**: Unhandled exceptions (logged)

**Error Response Format**:
```json
{
  "error": "Validation failed",
  "details": {
    "Title": ["The Title field is required."],
    "MimeType": ["MIME type application/zip is not allowed"]
  }
}
```

**Rationale**:
- Spec explicitly states "204 when GET targets a resource that does not exist" - must implement as specified
- Document in quickstart.md: "Note: API returns 204 instead of 404 for not-found resources (deviates from typical REST)"
- Provide consistent error structure for 400 responses (aids debugging)

**Alternatives Considered**:
- **Use 404 for not found**: Rejected - contradicts spec requirement
- **Custom status codes**: Rejected - breaks HTTP standards

---

## Decision 10: Logging Strategy

**Context**: Need minimal logging for local development; plan for future monitoring.

**Decision**: Use built-in `ILogger<T>` with file + console sinks

**Logging Points**:
- Request start/end with correlation ID (middleware)
- Validation failures (service layer)
- Repository query execution (EF logging)
- File storage operations (IFileStore implementations)
- Unhandled exceptions (global exception handler)

**Configuration** (`appsettings.json`):
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    },
    "File": {
      "Path": "logs/agentcms-.log",
      "RollingInterval": "Day"
    }
  }
}
```

**Rationale**:
- `ILogger<T>` is dependency-injection friendly (easily mockable)
- Structured logging support (JSON format for future log aggregation)
- File logs persist across restarts (useful for local debugging)
- Console output for real-time monitoring during development

**Alternatives Considered**:
- **Serilog library**: Rejected - spec asks to avoid external libraries; built-in logging sufficient
- **No logging**: Rejected - operational requirement for debugging and monitoring

**Future Integration Points**:
- Add Application Insights sink for Azure monitoring
- Add correlation ID propagation for distributed tracing
- Add structured event logging (e.g., "SiteCreated" events for audit trail)

---

## Best Practices Identified

### .NET 8 API Development
1. Use minimal hosting model (`var builder = WebApplication.CreateBuilder(args)`)
2. Enable Swagger UI in development mode for API exploration
3. Configure CORS for future frontend integration (currently localhost-only)
4. Use async/await throughout (all I/O operations: DB, file storage)
5. Enable request buffering for large file uploads (prevent memory exhaustion)

### EF Core Patterns
1. Always call `.AsNoTracking()` for read-only queries (performance)
2. Use `.ConfigureAwait(false)` for library code (avoid deadlocks)
3. Disable cascade delete where manual checks required (Site deletion guard)
4. Use GUID primary keys (`Guid.NewGuid()` server-side, not client-provided)

### File Storage Security
1. Never trust client-provided filenames (path traversal risk)
2. Generate GUID filenames server-side
3. Validate MIME type via file content (magic bytes), not just extension
4. Store files outside webroot (prevent direct URL access bypassing authorization)
5. Set restrictive file permissions on upload directory

### API Security (Future)
1. Design for API key middleware injection (placeholder `CreatedBy` parameter)
2. Add rate limiting configuration point (currently unlimited)
3. Plan for HTTPS enforcement (currently allow HTTP for local dev)
4. Add `X-Request-ID` header for request tracking

---

## Technology Stack Summary

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | .NET 8 | LTS, excellent tooling, Windows native |
| **Web Server** | Kestrel (ASP.NET Core) | Lightweight, production-grade, zero config |
| **Data Access** | Entity Framework Core | Code-first migrations, LINQ, strong typing |
| **Database** | SQL Server Express (local) | Free, Windows-integrated auth, robust |
| **File Storage** | Local filesystem (abstracted via `IFileStore`) | Simple, swappable, configurable |
| **Testing** | xUnit | .NET standard, good VS integration |
| **Validation** | Data Annotations + custom service logic | Built-in, no external library |
| **Logging** | `ILogger<T>` (built-in) | Structured, DI-friendly, extensible |
| **Serialization** | System.Text.Json | Built-in .NET 8, high performance |
| **API Documentation** | Swagger/OpenAPI (Swashbuckle) | Standard, auto-generated from code |

---

## Risks & Mitigations

### Risk: Anonymous Write Access
- **Impact**: Malicious or accidental data corruption
- **Mitigation**: Keep deployment local-only; design clear auth extension points; add comprehensive validation

### Risk: 204 for Not Found (Non-Standard)
- **Impact**: Client confusion, violates REST expectations
- **Mitigation**: Document prominently in quickstart.md and OpenAPI; consider 404 in future API version

### Risk: File Storage Path Traversal
- **Impact**: Unauthorized file system access
- **Mitigation**: Generate GUID filenames server-side; validate MIME via magic bytes; store outside webroot

### Risk: SQL Injection (Low probability with EF)
- **Impact**: Database compromise
- **Mitigation**: Use parameterized queries (EF default); never concatenate user input into SQL strings

### Risk: Large File Upload DoS
- **Impact**: Memory exhaustion, service unavailability
- **Mitigation**: Enforce 30 MB limit; enable request streaming (IFormFile); add rate limiting in future

---

## Open Questions (None)

All technical decisions were provided in the architecture overview. No NEEDS CLARIFICATION items remain.

---

**Next Steps**: Proceed to Phase 1 - generate data model, API contracts, and quickstart documentation.
