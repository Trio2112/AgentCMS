# Data Model Specification

**Feature**: AgentCMS CRUD API  
**Date**: 2026-02-12  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the complete data model for AgentCMS, including entity schemas, validation rules, relationships, and state transitions. The model supports multi-tenant content management with site-scoped isolation.

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       Site          │
│─────────────────────│
│ Id (PK)       GUID  │
│ Name*         255   │
│ Description   255   │
└─────────────────────┘
         │ 1
         │
         │ owns
         │
         ├───────────────────┐
         │                   │
         │ *                 │ *
┌────────▼──────────┐  ┌─────▼──────────────┐
│      Page         │  │      Asset         │
│───────────────────│  │────────────────────│
│ Id (PK)      GUID │  │ Id (PK)       GUID │
│ SiteId* (FK) GUID │  │ SiteId* (FK)  GUID │
│ Title*       255  │  │ Filename*     255  │
│ Body         max  │  │ MimeType*     100  │
│ CreatedDate* UTC  │  │ Url*          500  │
│ UpdatedDate* UTC  │  │ CreatedDate*  UTC  │
│ PublishedDate UTC │  │ CreatedBy     255  │
│ CreatedBy    255  │  └────────────────────┘
│ UpdatedBy    255  │
└───────────────────┘

Legend:
* = required (NOT NULL)
PK = Primary Key
FK = Foreign Key
GUID = Globally Unique Identifier
UTC = DateTime in UTC timezone
max = varchar(max) / unlimited text
```

---

## Entity Definitions

### Entity: Site

**Purpose**: Top-level tenant container for all CMS content. Provides logical isolation boundary for pages and assets.

**Table**: `Sites`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `Id` | GUID | PRIMARY KEY, NOT NULL | Unique identifier (server-generated) |
| `Name` | VARCHAR(255) | NOT NULL, UNIQUE | Human-readable site name |
| `Description` | VARCHAR(255) | NULL | Optional site description |

**Indexes**:
- Primary: `Id` (clustered)
- Unique: `Name` (non-clustered, for lookups)

**Validation Rules**:
- `Name`: Required, max 255 characters, must be unique across all sites
- `Description`: Optional, max 255 characters

**Business Rules**:
- **Deletion Guard**: Cannot delete a Site if it has any related Pages or Assets
  - Enforcement: Service layer checks `COUNT(*) FROM Pages WHERE SiteId = @id` and `COUNT(*) FROM Assets WHERE SiteId = @id`
  - Returns 400 Bad Request with message: `"Cannot delete site with existing content. Delete all pages and assets first."`

**State Transitions**: None (simple CRUD entity)

**C# Entity Model**:
```csharp
public class Site
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // Navigation properties (EF relationships)
    public ICollection<Page> Pages { get; set; } = new List<Page>();
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
```

**EF Fluent Configuration**:
```csharp
modelBuilder.Entity<Site>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
    entity.HasIndex(e => e.Name).IsUnique();
    entity.Property(e => e.Description).HasMaxLength(255);
    
    entity.HasMany(e => e.Pages)
          .WithOne(e => e.Site)
          .HasForeignKey(e => e.SiteId)
          .OnDelete(DeleteBehavior.Restrict); // Enforce manual deletion guard
    
    entity.HasMany(e => e.Assets)
          .WithOne(e => e.Site)
          .HasForeignKey(e => e.SiteId)
          .OnDelete(DeleteBehavior.Restrict);
});
```

---

### Entity: Page

**Purpose**: Content page with lifecycle states (draft/published). Core content type for CMS.

**Table**: `Pages`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `Id` | GUID | PRIMARY KEY, NOT NULL | Unique identifier (server-generated) |
| `SiteId` | GUID | FOREIGN KEY (Sites.Id), NOT NULL | Tenant isolation - owning site |
| `Title` | VARCHAR(255) | NOT NULL | Page title |
| `Body` | VARCHAR(MAX) | NULL | Page content (HTML/Markdown/plain text) |
| `CreatedDate` | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | UTC timestamp of creation |
| `UpdatedDate` | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | UTC timestamp of last update |
| `PublishedDate` | DATETIME2 | NULL | UTC timestamp of publication (NULL = draft) |
| `CreatedBy` | VARCHAR(255) | NULL | User/system that created the page |
| `UpdatedBy` | VARCHAR(255) | NULL | User/system that last updated the page |

**Indexes**:
- Primary: `Id` (clustered)
- Foreign Key: `SiteId` (non-clustered, filtered queries)
- Composite: `(SiteId, PublishedDate)` (non-clustered, for published page queries)

**Validation Rules**:
- `Title`: Required, max 255 characters
- `Body`: Optional, unlimited length (VARCHAR(MAX))
- `SiteId`: Required, must reference existing Site
- `CreatedDate`, `UpdatedDate`: Server-controlled, UTC timezone
- `PublishedDate`: Server-controlled, UTC timezone when set
- `CreatedBy`, `UpdatedBy`: Max 255 characters (future: user ID from auth system)

**State Machine**:

```
┌─────────────────────────┐
│    Initial (Create)     │
└───────────┬─────────────┘
            │
            ▼
     ┌──────────────┐
     │    DRAFT     │
     │ (null date)  │
     └──────┬───────┘
            │
            │ Publish (set PublishedDate)
            ▼
     ┌──────────────┐
     │  PUBLISHED   │
     │ (has date)   │
     └──────┬───────┘
            │
            │ Unpublish (set PublishedDate = null)
            ▼
     ┌──────────────┐
     │    DRAFT     │
     └──────────────┘

State Logic:
- Draft: PublishedDate IS NULL
- Published: PublishedDate IS NOT NULL
```

**Business Rules**:
- **Tenant Isolation**: All queries MUST filter by `SiteId`
  - Invalid: `SELECT * FROM Pages WHERE Id = @id`
  - Valid: `SELECT * FROM Pages WHERE Id = @id AND SiteId = @siteId`
- **Timestamp Management**: Service layer sets `CreatedDate` on create, `UpdatedDate` on every update
- **Publish Workflow**: 
  - Create page → Draft state (PublishedDate = NULL)
  - Update with `IsPublished = true` (DTO) → Set PublishedDate = UTC now
  - Update with `IsPublished = false` (DTO) → Set PublishedDate = NULL (unpublish)
- **Idempotency**: Publishing an already-published page updates PublishedDate (no error)

**C# Entity Model**:
```csharp
public class Page
{
    public Guid Id { get; set; }
    public Guid SiteId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public DateTime? PublishedDate { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    
    // Navigation property
    public Site Site { get; set; } = null!;
    
    // Computed property (not stored)
    public bool IsPublished => PublishedDate.HasValue;
}
```

**EF Fluent Configuration**:
```csharp
modelBuilder.Entity<Page>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
    entity.Property(e => e.Body).HasColumnType("VARCHAR(MAX)");
    entity.Property(e => e.CreatedDate).IsRequired().HasDefaultValueSql("GETUTCDATE()");
    entity.Property(e => e.UpdatedDate).IsRequired().HasDefaultValueSql("GETUTCDATE()");
    entity.Property(e => e.PublishedDate).IsRequired(false);
    entity.Property(e => e.CreatedBy).HasMaxLength(255);
    entity.Property(e => e.UpdatedBy).HasMaxLength(255);
    
    entity.HasIndex(e => e.SiteId);
    entity.HasIndex(e => new { e.SiteId, e.PublishedDate });
    
    entity.HasOne(e => e.Site)
          .WithMany(e => e.Pages)
          .HasForeignKey(e => e.SiteId)
          .OnDelete(DeleteBehavior.Restrict);
});
```

---

### Entity: Asset

**Purpose**: Uploaded media file (image, document) with storage abstraction. Supports both direct upload and client-provided URLs.

**Table**: `Assets`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `Id` | GUID | PRIMARY KEY, NOT NULL | Unique identifier (server-generated) |
| `SiteId` | GUID | FOREIGN KEY (Sites.Id), NOT NULL | Tenant isolation - owning site |
| `Filename` | VARCHAR(255) | NOT NULL | Original filename (user-provided or extracted) |
| `MimeType` | VARCHAR(100) | NOT NULL | Content type (e.g., image/jpeg) |
| `Url` | VARCHAR(500) | NOT NULL | Accessible URL (local API or external) |
| `CreatedDate` | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | UTC timestamp of creation |
| `CreatedBy` | VARCHAR(255) | NULL | User/system that uploaded the asset |

**Indexes**:
- Primary: `Id` (clustered)
- Foreign Key: `SiteId` (non-clustered, filtered queries)

**Validation Rules**:
- `Filename`: Required, max 255 characters (sanitize before storage)
- `MimeType`: Required, max 100 characters, **MUST** be in whitelist:
  - `image/jpeg`
  - `image/png`
  - `application/pdf`
- `Url`: Required, max 500 characters
  - For uploaded files: `https://localhost:5001/v1/sites/{siteId}/assets/{assetId}/file`
  - For client-provided URLs: stored as-is (no local copy)
- `SiteId`: Required, must reference existing Site
- `CreatedDate`: Server-controlled, UTC timezone
- **File Size**: 30 MB maximum (validated at upload, not stored in DB)

**Storage Strategy**:

| Upload Type | Storage Location | Url Format | Notes |
|-------------|------------------|------------|-------|
| **Multipart Upload** | Local filesystem (configurable path, GUID filename) | `{baseUrl}/v1/sites/{siteId}/assets/{assetId}/file` | File stored locally, download endpoint streams content |
| **Client-Provided URL** | No local copy | Client-provided URL (stored as-is) | Trust client; no file size validation possible |

**Business Rules**:
- **Tenant Isolation**: All queries MUST filter by `SiteId`
- **MIME Type Whitelist**: Reject uploads with disallowed types (400 Bad Request)
- **File Size Limit**: Reject uploads > 30 MB (400 Bad Request)
- **Storage Path Security**: 
  - Generate GUID filename server-side (prevents path traversal)
  - Store files outside webroot
  - Validate MIME via file content (magic bytes), not extension alone
- **Deletion**: Deleting an Asset MUST also delete the underlying file (if multipart upload)

**File Download Flow**:
1. Client: `GET /v1/sites/{siteId}/assets/{assetId}/file`
2. Service: Lookup Asset by `Id` and `SiteId` (tenant isolation)
3. Service: Extract storage path from Asset.Url (or internal storage mapping)
4. Service: Call `IFileStore.GetStreamAsync(storagePath)`
5. Controller: Stream file to client with `Content-Type: {Asset.MimeType}` header
6. Return 404 if Asset not found or file missing

**C# Entity Model**:
```csharp
public class Asset
{
    public Guid Id { get; set; }
    public Guid SiteId { get; set; }
    public string Filename { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
    
    // Navigation property
    public Site Site { get; set; } = null!;
}
```

**EF Fluent Configuration**:
```csharp
modelBuilder.Entity<Asset>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Filename).IsRequired().HasMaxLength(255);
    entity.Property(e => e.MimeType).IsRequired().HasMaxLength(100);
    entity.Property(e => e.Url).IsRequired().HasMaxLength(500);
    entity.Property(e => e.CreatedDate).IsRequired().HasDefaultValueSql("GETUTCDATE()");
    entity.Property(e => e.CreatedBy).HasMaxLength(255);
    
    entity.HasIndex(e => e.SiteId);
    
    entity.HasOne(e => e.Site)
          .WithMany(e => e.Assets)
          .HasForeignKey(e => e.SiteId)
          .OnDelete(DeleteBehavior.Restrict);
});
```

---

## DTO Definitions

DTOs (Data Transfer Objects) decouple API contracts from database entities. Never expose EF entities directly in API responses.

### SiteDto

**Purpose**: API representation of Site entity

```csharp
public class SiteDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateSiteDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? Description { get; set; }
}

public class UpdateSiteDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? Description { get; set; }
}
```

---

### PageDto

**Purpose**: API representation of Page entity with publish state as boolean

```csharp
public class PageDto
{
    public Guid Id { get; set; }
    public Guid SiteId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public DateTime? PublishedDate { get; set; }
    public bool IsPublished { get; set; } // Computed: PublishedDate != null
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

public class CreatePageDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    
    public string? Body { get; set; }
    
    public bool IsPublished { get; set; } // Maps to PublishedDate (true = now, false = null)
    
    public string? CreatedBy { get; set; }
}

public class UpdatePageDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    
    public string? Body { get; set; }
    
    public bool IsPublished { get; set; }
    
    public string? UpdatedBy { get; set; }
}
```

**Mapping Logic** (Service Layer):
```csharp
// CreatePageDto → Page
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

// Page → PageDto
var pageDto = new PageDto
{
    Id = page.Id,
    SiteId = page.SiteId,
    Title = page.Title,
    Body = page.Body,
    CreatedDate = page.CreatedDate,
    UpdatedDate = page.UpdatedDate,
    PublishedDate = page.PublishedDate,
    IsPublished = page.PublishedDate.HasValue,
    CreatedBy = page.CreatedBy,
    UpdatedBy = page.UpdatedBy
};
```

---

### AssetDto

**Purpose**: API representation of Asset entity

```csharp
public class AssetDto
{
    public Guid Id { get; set; }
    public Guid SiteId { get; set; }
    public string Filename { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
}

// For multipart file upload
public class CreateAssetDto
{
    [Required]
    public IFormFile File { get; set; } = null!;
    
    public string? CreatedBy { get; set; }
}

// For client-provided URL
public class CreateAssetFromUrlDto
{
    [Required]
    [MaxLength(500)]
    [Url]
    public string Url { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string Filename { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string MimeType { get; set; } = string.Empty;
    
    public string? CreatedBy { get; set; }
}
```

---

## Validation Matrix

| Field | Required | Max Length | Type | Additional Rules |
|-------|----------|------------|------|------------------|
| **Site.Name** | ✅ | 255 | String | Must be unique |
| **Site.Description** | ❌ | 255 | String | |
| **Page.Title** | ✅ | 255 | String | |
| **Page.Body** | ❌ | Unlimited | String | VARCHAR(MAX) |
| **Page.SiteId** | ✅ | - | GUID | Must exist in Sites |
| **Page.IsPublished** | ✅ | - | Boolean | Maps to PublishedDate |
| **Asset.Filename** | ✅ | 255 | String | |
| **Asset.MimeType** | ✅ | 100 | String | Must be in whitelist |
| **Asset.Url** | ✅ | 500 | String | Valid URL format |
| **Asset.SiteId** | ✅ | - | GUID | Must exist in Sites |
| **Asset.File** | ✅* | - | File | *Only for multipart upload; max 30 MB |

---

## Relationships & Referential Integrity

### Site → Page (One-to-Many)
- **Foreign Key**: `Page.SiteId` → `Site.Id`
- **Delete Behavior**: `RESTRICT` (manual guard in service layer)
- **Cascade Query**: Deleting a Site requires checking `COUNT(*) FROM Pages WHERE SiteId = @id`

### Site → Asset (One-to-Many)
- **Foreign Key**: `Asset.SiteId` → `Site.Id`
- **Delete Behavior**: `RESTRICT` (manual guard in service layer)
- **Cascade Query**: Deleting a Site requires checking `COUNT(*) FROM Assets WHERE SiteId = @id`

### Tenant Isolation Enforcement
All repository methods MUST include `SiteId` in WHERE clause:
```sql
-- CORRECT
SELECT * FROM Pages WHERE Id = @id AND SiteId = @siteId;

-- INCORRECT (leaks cross-tenant data)
SELECT * FROM Pages WHERE Id = @id;
```

---

## Database Schema Script

```sql
CREATE TABLE Sites (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name VARCHAR(255) NOT NULL,
    Description VARCHAR(255) NULL,
    CONSTRAINT UQ_Sites_Name UNIQUE (Name)
);

CREATE TABLE Pages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteId UNIQUEIDENTIFIER NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Body VARCHAR(MAX) NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PublishedDate DATETIME2 NULL,
    CreatedBy VARCHAR(255) NULL,
    UpdatedBy VARCHAR(255) NULL,
    CONSTRAINT FK_Pages_Sites FOREIGN KEY (SiteId) REFERENCES Sites(Id) ON DELETE NO ACTION,
    INDEX IX_Pages_SiteId (SiteId),
    INDEX IX_Pages_SiteId_PublishedDate (SiteId, PublishedDate)
);

CREATE TABLE Assets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SiteId UNIQUEIDENTIFIER NOT NULL,
    Filename VARCHAR(255) NOT NULL,
    MimeType VARCHAR(100) NOT NULL,
    Url VARCHAR(500) NOT NULL,
    CreatedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy VARCHAR(255) NULL,
    CONSTRAINT FK_Assets_Sites FOREIGN KEY (SiteId) REFERENCES Sites(Id) ON DELETE NO ACTION,
    INDEX IX_Assets_SiteId (SiteId)
);
```

---

## Migration Strategy

### Initial Migration (EF Core)
```bash
dotnet ef migrations add InitialCreate --project agentcms.api
dotnet ef database update --project agentcms.api
```

### Future Schema Changes
1. Add new fields as nullable or with default values (backward compatible)
2. Create new migration: `dotnet ef migrations add AddFieldName`
3. Test migration on local dev database
4. Update DTOs and service layer to populate new fields
5. Update OpenAPI contract documentation
6. Version API if breaking change (e.g., remove field → v2)

---

## Data Access Patterns

### Query Examples

**List all Sites**:
```csharp
var sites = await _context.Sites
    .AsNoTracking()
    .OrderBy(s => s.Name)
    .ToListAsync();
```

**Get Page by ID with Tenant Isolation**:
```csharp
var page = await _context.Pages
    .AsNoTracking()
    .Where(p => p.Id == pageId && p.SiteId == siteId)
    .SingleOrDefaultAsync();
```

**List Published Pages for Site**:
```csharp
var pages = await _context.Pages
    .AsNoTracking()
    .Where(p => p.SiteId == siteId && p.PublishedDate != null)
    .OrderByDescending(p => p.PublishedDate)
    .ToListAsync();
```

**Count Content for Site Deletion Guard**:
```csharp
var pageCount = await _context.Pages.CountAsync(p => p.SiteId == siteId);
var assetCount = await _context.Assets.CountAsync(a => a.SiteId == siteId);

if (pageCount > 0 || assetCount > 0)
{
    throw new ValidationException($"Cannot delete site with {pageCount} pages and {assetCount} assets");
}
```

---

## Performance Considerations

### Indexing Strategy
- **Primary Keys**: Clustered indexes on GUID `Id` columns (default EF behavior)
- **Foreign Keys**: Non-clustered indexes on `SiteId` (frequent join/filter target)
- **Composite Index**: `(SiteId, PublishedDate)` for published page queries
- **Unique Index**: `Sites.Name` for uniqueness constraint + fast lookups

### Query Optimization
- Always use `.AsNoTracking()` for read-only queries (50%+ performance gain)
- Avoid `SELECT *` - project only needed columns in service layer
- Use pagination for list endpoints (future: add `page` and `pageSize` query params)
- Consider read replicas for high-traffic scenarios (future: if scaling needed)

### File Storage
- Store files outside webroot (e.g., `C:\AgentCMS\uploads`) to prevent direct access
- Use streaming for file downloads (avoid loading entire file into memory)
- Consider CDN for asset delivery in production (future enhancement)

---

## Security Considerations

### SQL Injection Prevention
- **Always** use parameterized queries (EF Core default)
- **Never** concatenate user input into SQL strings

### Path Traversal Prevention
- Generate GUID filenames server-side (ignore client-provided filenames)
- Validate file paths before reading/deleting
- Store files in isolated directory with restrictive ACLs

### MIME Type Validation
- Validate via file content (magic bytes), not extension alone
- Reject files outside whitelist (image/jpeg, image/png, application/pdf)
- Consider adding virus scanning for production (future)

### Tenant Isolation
- **Every** repository method MUST filter by `SiteId`
- Add integration tests verifying cross-tenant access is blocked
- Consider row-level security (RLS) in SQL Server for defense-in-depth

---

## Testing Strategy

### Unit Tests (Repository Layer)
- CRUD operations for each entity
- Tenant isolation enforcement (negative tests: wrong SiteId returns empty)
- Cascade delete prevention (Site deletion with content)

### Integration Tests (Service Layer)
- Validation rules (required fields, max lengths, MIME whitelist)
- Timestamp management (CreatedDate, UpdatedDate auto-populated)
- Publish workflow (IsPublished ↔ PublishedDate mapping)
- File upload/download flow

### Contract Tests (API Layer)
- Request/response schema validation (OpenAPI contract)
- Status code correctness (201, 200, 204, 400)
- Location header on create operations

---

**Next Steps**: Generate OpenAPI contracts in `contracts/` directory.
