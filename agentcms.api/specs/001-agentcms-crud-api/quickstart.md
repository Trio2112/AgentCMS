# AgentCMS CRUD API - Quickstart Guide

**Feature**: AgentCMS CRUD API  
**Version**: v1.0.0  
**Date**: 2026-02-12

## Overview

AgentCMS is a RESTful headless CMS API for managing multi-tenant content (Sites, Pages, Assets). This guide will help you set up the API locally and perform basic operations.

---

## ⚠️ Important Notices

### Security Warning

**This API has NO AUTHENTICATION in v1.** It is designed for local development only. Do not expose this API to external networks or the internet.

- ❌ No API keys required
- ❌ No user authentication
- ❌ No authorization checks
- ✅ Designed for localhost-only use

**Future versions will add API key authentication.**

### Non-Standard Behavior

This API returns **204 No Content** instead of **404 Not Found** when resources don't exist. This deviates from REST standards.

```http
GET /v1/sites/00000000-0000-0000-0000-000000000000
HTTP/1.1 204 No Content
```

This behavior is documented in the feature spec and may change in v2.

---

## Prerequisites

### Required Software

1. **.NET 8 SDK**: [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
2. **SQL Server Express** (local instance): [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
3. **Git**: [Download](https://git-scm.com/downloads)
4. **Code Editor**: Visual Studio 2022, VS Code, or Rider

### Verify Installation

```powershell
# Check .NET version
dotnet --version
# Expected: 8.0.x

# Check SQL Server (should list local instance)
sqlcmd -L
# Expected: localhost\SQLEXPRESS or similar
```

---

## Setup Instructions

### 1. Clone Repository

```powershell
git clone https://github.com/your-org/agentcms.git
cd agentcms/agentcms.api
```

### 2. Configure Database Connection

Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=AgentCMS;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "FileStorage": {
    "Provider": "Local",
    "LocalPath": "C:\\AgentCMS\\uploads",
    "BaseUrl": "https://localhost:5001"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

**Configuration Notes**:
- `Server`: Update if your SQL Server instance has a different name
- `LocalPath`: File upload directory (will be created automatically)
- `BaseUrl`: Change if using different port

### 3. Create Database

Run Entity Framework migrations to create the database:

```powershell
# Install EF Core tools (if not already installed)
dotnet tool install --global dotnet-ef

# Create database and apply migrations
dotnet ef database update
```

**Expected Output**:
```
Build started...
Build succeeded.
Applying migration '20260212_InitialCreate'.
Done.
```

### 4. Create File Storage Directory

```powershell
# Create uploads directory (if not exists)
New-Item -ItemType Directory -Force -Path "C:\AgentCMS\uploads"
```

### 5. Run the API

```powershell
dotnet run
```

**Expected Output**:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 6. Verify API is Running

Open browser to: [https://localhost:5001/swagger](https://localhost:5001/swagger)

You should see the Swagger UI with all API endpoints.

---

## Basic Usage

### Using Swagger UI (Recommended for Testing)

1. Navigate to: [https://localhost:5001/swagger](https://localhost:5001/swagger)
2. Click on any endpoint to expand
3. Click "Try it out"
4. Fill in parameters and request body
5. Click "Execute"

### Using PowerShell (curl equivalent)

#### Create a Site

```powershell
$siteBody = @{
    name = "My Blog"
    description = "Personal blog site"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites" `
    -Method Post `
    -ContentType "application/json" `
    -Body $siteBody `
    -SkipCertificateCheck

Write-Host "Created Site ID: $($response.id)"
```

**Response**:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "My Blog",
  "description": "Personal blog site"
}
```

#### List All Sites

```powershell
$sites = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites" `
    -Method Get `
    -SkipCertificateCheck

$sites | Format-Table -Property id, name, description
```

#### Create a Page (Draft State)

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"  # Replace with your site ID

$pageBody = @{
    title = "Welcome to My Blog"
    body = "This is my first blog post!"
    isPublished = $false  # Creates as draft
    createdBy = "admin"
} | ConvertTo-Json

$page = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages" `
    -Method Post `
    -ContentType "application/json" `
    -Body $pageBody `
    -SkipCertificateCheck

Write-Host "Created Page ID: $($page.id)"
Write-Host "Is Published: $($page.isPublished)"
```

**Response**:
```json
{
  "id": "7b2c8e4a-1234-5678-90ab-cdef12345678",
  "siteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "title": "Welcome to My Blog",
  "body": "This is my first blog post!",
  "createdDate": "2026-02-12T15:30:00Z",
  "updatedDate": "2026-02-12T15:30:00Z",
  "publishedDate": null,
  "isPublished": false,
  "createdBy": "admin",
  "updatedBy": "admin"
}
```

#### Publish a Page

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
$pageId = "7b2c8e4a-1234-5678-90ab-cdef12345678"

$updateBody = @{
    title = "Welcome to My Blog"
    body = "This is my first blog post!"
    isPublished = $true  # Publishes the page
    updatedBy = "admin"
} | ConvertTo-Json

$updatedPage = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages/$pageId" `
    -Method Put `
    -ContentType "application/json" `
    -Body $updateBody `
    -SkipCertificateCheck

Write-Host "Published Date: $($updatedPage.publishedDate)"
```

#### Filter Published Pages

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"

# Get only published pages
$publishedPages = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages?isPublished=true" `
    -Method Get `
    -SkipCertificateCheck

Write-Host "Published Pages: $($publishedPages.Count)"

# Get only draft pages
$draftPages = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages?isPublished=false" `
    -Method Get `
    -SkipCertificateCheck

Write-Host "Draft Pages: $($draftPages.Count)"
```

#### Upload an Asset

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
$filePath = "C:\path\to\image.jpg"

# Create multipart form data
$form = @{
    file = Get-Item -Path $filePath
    createdBy = "admin"
}

$asset = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/assets" `
    -Method Post `
    -Form $form `
    -SkipCertificateCheck

Write-Host "Asset ID: $($asset.id)"
Write-Host "Asset URL: $($asset.url)"
```

**Response**:
```json
{
  "id": "9d4e6f2a-abcd-1234-5678-90abcdef1234",
  "siteId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "filename": "image.jpg",
  "mimeType": "image/jpeg",
  "url": "https://localhost:5001/v1/sites/3fa85f64-5717-4562-b3fc-2c963f66afa6/assets/9d4e6f2a-abcd-1234-5678-90abcdef1234/file",
  "createdDate": "2026-02-12T15:45:00Z",
  "createdBy": "admin"
}
```

#### Download an Asset

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
$assetId = "9d4e6f2a-abcd-1234-5678-90abcdef1234"

Invoke-WebRequest -Uri "https://localhost:5001/v1/sites/$siteId/assets/$assetId/file" `
    -OutFile "downloaded-image.jpg" `
    -SkipCertificateCheck

Write-Host "Downloaded to: downloaded-image.jpg"
```

#### Create Asset from External URL

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"

$assetBody = @{
    url = "https://example.com/photo.jpg"
    filename = "photo.jpg"
    mimeType = "image/jpeg"
    createdBy = "admin"
} | ConvertTo-Json

$asset = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/assets/url" `
    -Method Post `
    -ContentType "application/json" `
    -Body $assetBody `
    -SkipCertificateCheck

Write-Host "Asset URL (external): $($asset.url)"
```

#### Delete a Page

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
$pageId = "7b2c8e4a-1234-5678-90ab-cdef12345678"

Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages/$pageId" `
    -Method Delete `
    -SkipCertificateCheck

Write-Host "Page deleted"
```

#### Delete a Site (with Content Guard)

```powershell
$siteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"

try {
    Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId" `
        -Method Delete `
        -SkipCertificateCheck
    Write-Host "Site deleted"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    # Expected if site has content: "Cannot delete site with existing content"
}
```

---

## Common Workflows

### Workflow 1: Create Site with Published Page

```powershell
# 1. Create site
$site = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{ name = "News Site"; description = "Daily news" } | ConvertTo-Json) `
    -SkipCertificateCheck

$siteId = $site.id

# 2. Create published page
$page = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{ title = "Breaking News"; body = "Lorem ipsum..."; isPublished = $true } | ConvertTo-Json) `
    -SkipCertificateCheck

Write-Host "Created site $($site.name) with published page $($page.title)"
```

### Workflow 2: Draft → Review → Publish

```powershell
$siteId = "your-site-id"

# 1. Create draft
$draft = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{ title = "Draft Article"; body = "WIP content"; isPublished = $false; createdBy = "editor" } | ConvertTo-Json) `
    -SkipCertificateCheck

# 2. Review draft (simulate time passing)
Start-Sleep -Seconds 5

# 3. Publish
$published = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages/$($draft.id)" `
    -Method Put `
    -ContentType "application/json" `
    -Body (@{ title = "Published Article"; body = "Final content"; isPublished = $true; updatedBy = "publisher" } | ConvertTo-Json) `
    -SkipCertificateCheck

Write-Host "Published: $($published.publishedDate)"
```

### Workflow 3: Upload Image and Reference in Page

```powershell
$siteId = "your-site-id"

# 1. Upload image
$form = @{ file = Get-Item -Path "C:\images\header.jpg" }
$asset = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/assets" `
    -Method Post -Form $form -SkipCertificateCheck

# 2. Create page with image reference
$pageBody = @{
    title = "Article with Image"
    body = "![Header Image]($($asset.url))"  # Markdown format
    isPublished = $true
} | ConvertTo-Json

$page = Invoke-RestMethod -Uri "https://localhost:5001/v1/sites/$siteId/pages" `
    -Method Post -ContentType "application/json" -Body $pageBody -SkipCertificateCheck

Write-Host "Page created with image: $($page.id)"
```

---

## Validation Rules

### Sites
- **Name**: Required, max 255 characters, must be unique
- **Description**: Optional, max 255 characters

### Pages
- **Title**: Required, max 255 characters
- **Body**: Optional, unlimited length
- **IsPublished**: Required boolean (maps to PublishedDate)
- **SiteId**: Must exist in Sites table

### Assets
- **File Upload**:
  - Max size: 30 MB
  - Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`
- **Client-Provided URL**:
  - Must be valid URL format
  - MIME type must be in whitelist
  - No file size validation (external resource)

---

## Error Handling

### Validation Errors (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": {
    "Title": ["The Title field is required."],
    "MimeType": ["MIME type application/zip is not allowed"]
  }
}
```

### Business Rule Violations (400 Bad Request)

```json
{
  "error": "Cannot delete site with existing content",
  "details": {
    "message": ["Site has 5 pages and 3 assets. Delete all content first."]
  }
}
```

### Resource Not Found (204 No Content)

```http
GET /v1/sites/00000000-0000-0000-0000-000000000000
HTTP/1.1 204 No Content
```

**Note**: 204 instead of 404 is non-standard behavior.

### Server Errors (500 Internal Server Error)

```json
{
  "error": "Internal server error",
  "details": {}
}
```

Check logs in `logs/agentcms-YYYYMMDD.log` for details.

---

## Troubleshooting

### Database Connection Fails

**Error**: `Cannot open database "AgentCMS" requested by the login`

**Solution**:
1. Verify SQL Server is running: `Get-Service | Where-Object {$_.Name -like "*SQL*"}`
2. Check connection string in `appsettings.json`
3. Run migrations: `dotnet ef database update`

### File Upload Fails

**Error**: `Access to the path 'C:\AgentCMS\uploads' is denied`

**Solution**:
1. Create directory: `New-Item -ItemType Directory -Force -Path "C:\AgentCMS\uploads"`
2. Grant write permissions:
   ```powershell
   $acl = Get-Acl "C:\AgentCMS\uploads"
   $permission = "$env:USERNAME","FullControl","Allow"
   $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
   $acl.SetAccessRule($accessRule)
   Set-Acl "C:\AgentCMS\uploads" $acl
   ```

### MIME Type Rejected

**Error**: `MIME type application/zip is not allowed`

**Solution**: Only `image/jpeg`, `image/png`, and `application/pdf` are allowed. Convert file or update whitelist in code.

### Cross-Tenant Access Issues

**Symptom**: Page exists but returns 204 when accessed via different site

**Solution**: Ensure you're using the correct `siteId` in the URL. Pages are scoped to sites (tenant isolation).

### SSL Certificate Errors

**Error**: `The SSL connection could not be established`

**Solution**: Use `-SkipCertificateCheck` flag in PowerShell (development only):
```powershell
Invoke-RestMethod -Uri "..." -SkipCertificateCheck
```

For production, use valid SSL certificate.

---

## API Reference

See complete API documentation:
- **OpenAPI Spec**: [contracts/openapi.yaml](contracts/openapi.yaml)
- **Swagger UI**: [https://localhost:5001/swagger](https://localhost:5001/swagger)
- **Data Model**: [data-model.md](data-model.md)
- **Research**: [research.md](research.md)

---

## Development Tips

### Hot Reload

Changes to C# code automatically reload during development:
```powershell
dotnet watch run
```

### Database Reset

To reset database (⚠️ deletes all data):
```powershell
dotnet ef database drop --force
dotnet ef database update
```

### View Logs

```powershell
Get-Content -Path "logs\agentcms-$(Get-Date -Format yyyyMMdd).log" -Tail 50 -Wait
```

### Test with Postman

1. Import OpenAPI spec: `contracts/openapi.yaml`
2. Postman auto-generates collection
3. Set base URL: `https://localhost:5001/v1`
4. Disable SSL verification in Postman settings

---

## Next Steps

1. **Read Data Model**: [data-model.md](data-model.md) - understand entity relationships
2. **Review API Contracts**: [contracts/openapi.yaml](contracts/openapi.yaml) - full endpoint reference
3. **Explore Research**: [research.md](research.md) - architecture decisions and best practices
4. **Implement Features**: Start building frontend or integrations using the API

---

## Support

- **Issues**: File in repository issue tracker
- **Questions**: See [plan.md](plan.md) for architecture overview
- **API Changes**: See [contracts/README.md](contracts/README.md) for versioning policy

---

**Version**: 1.0.0 | **Last Updated**: 2026-02-12
