# AgentCMS API Specification

## Overview

The AgentCMS API provides comprehensive RESTful CRUD operations for three core entities: Sites, Pages, and Assets. All endpoints follow URL-based versioning (v1) as defined in the architectural principles.

## Architecture Principles

- **URL-based versioning**: All endpoints are prefixed with `/v1`
- **Multi-tenant isolation**: Sites represent top-level containers with complete content isolation
- **Parent-child relationships**: Pages and Assets are nested under their parent Site
- **RESTful conventions**: Standard HTTP methods and status codes

## Data Models

### Site

Sites represent the top-level multi-tenant containers, with each site maintaining complete content isolation.

**Fields:**
- `Id` (Guid, primary key) - Unique identifier
- `Name` (string, required, max 255 characters) - Site name
- `Description` (string, optional, max 255 characters) - Site description

**Relationships:**
- One-to-many with Pages
- One-to-many with Assets

**Business Rules:**
- Sites cannot be deleted if they contain any Pages or Assets

### Page

Pages represent static HTML content resources that belong to a site.

**Fields:**
- `Id` (Guid, primary key) - Unique identifier
- `SiteId` (Guid, foreign key, required) - Parent site reference
- `Title` (string, required, max 255 characters) - Page title
- `Body` (string/text, required, varchar max) - HTML content
- `CreatedDate` (DateTime, required) - Creation timestamp (server-set)
- `UpdatedDate` (DateTime, required) - Last update timestamp (server-set)
- `PublishedDate` (DateTime, nullable) - Publication timestamp (server-set)
- `CreatedBy` (string, optional) - Creator identifier (client-provided)
- `UpdatedBy` (string, optional) - Last updater identifier (client-provided)

**Publication Status:**
- `PublishedDate` = null: Draft status
- `PublishedDate` = date value: Published status
- API includes `IsPublished` (boolean) in DTOs for client convenience
- Server translates between `IsPublished` and `PublishedDate` field

**Business Rules:**
- Pages belong to exactly one Site
- All timestamp fields are server-managed
- Audit "by" fields are client-provided in requests

### Asset

Assets represent uploaded media files (images and PDFs) associated with a site.

**Fields:**
- `Id` (Guid, primary key) - Unique identifier
- `SiteId` (Guid, foreign key, required) - Parent site reference
- `Filename` (string, required) - Original filename
- `MimeType` (string, required) - Content type
- `Url` (string, required) - File system location
- `CreatedDate` (DateTime, required) - Upload timestamp (server-set)
- `CreatedBy` (string, optional) - Uploader identifier (client-provided)

**Supported MIME Types:**
- `image/jpeg`
- `image/png`
- `application/pdf`

**File Storage:**
- Files stored on local file system
- GUID-based filenames for uniqueness
- Single directory location configurable via appsettings.json
- Maximum file size: 30 MB

**Future Enhancements:**
- Azure Blob Storage integration planned

**Business Rules:**
- Assets belong to exactly one Site
- Physical file and database record are created together
- Physical file and database record are deleted together

## API Endpoints

### Sites

#### List All Sites
```
GET /v1/sites
```
**Response:** 200 OK with array of Site objects

#### Get Single Site
```
GET /v1/sites/{siteId}
```
**Response:** 
- 200 OK with Site object
- 204 No Content if site not found

#### Create Site
```
POST /v1/sites
Content-Type: application/json

{
  "name": "string (required, max 255)",
  "description": "string (optional, max 255)"
}
```
**Response:** 
- 201 Created with Location header
- Location header contains URI of created resource
- Response body contains created Site object

#### Update Site
```
PUT /v1/sites/{siteId}
Content-Type: application/json

{
  "name": "string (required, max 255)",
  "description": "string (optional, max 255)"
}
```
**Response:** 
- 200 OK with empty response body
- 204 No Content if site not found

#### Delete Site
```
DELETE /v1/sites/{siteId}
```
**Response:** 
- 200 OK with empty response body
- 400 Bad Request if site contains Pages or Assets
- 204 No Content if site not found

### Pages

#### List All Pages for a Site
```
GET /v1/sites/{siteId}/pages
```
**Response:** 200 OK with array of Page objects

#### Get Single Page
```
GET /v1/sites/{siteId}/pages/{pageId}
```
**Response:** 
- 200 OK with Page object (includes IsPublished boolean)
- 204 No Content if page not found

#### Create Page
```
POST /v1/sites/{siteId}/pages
Content-Type: application/json

{
  "title": "string (required, max 255)",
  "body": "string (required, varchar max)",
  "isPublished": "boolean (optional)",
  "createdBy": "string (optional)",
  "updatedBy": "string (optional)"
}
```
**Response:** 
- 201 Created with Location header
- Location header contains URI of created resource
- Response body contains created Page object
- Server sets CreatedDate, UpdatedDate, and PublishedDate based on IsPublished

#### Update Page
```
PUT /v1/sites/{siteId}/pages/{pageId}
Content-Type: application/json

{
  "title": "string (required, max 255)",
  "body": "string (required, varchar max)",
  "isPublished": "boolean (optional)",
  "updatedBy": "string (optional)"
}
```
**Response:** 
- 200 OK with empty response body
- Server updates UpdatedDate and PublishedDate based on IsPublished
- 204 No Content if page not found

#### Delete Page
```
DELETE /v1/sites/{siteId}/pages/{pageId}
```
**Response:** 
- 200 OK with empty response body
- 204 No Content if page not found

### Assets

#### List All Assets for a Site
```
GET /v1/sites/{siteId}/assets
```
**Response:** 200 OK with array of Asset objects

#### Get Single Asset
```
GET /v1/sites/{siteId}/assets/{assetId}
```
**Response:** 
- 200 OK with Asset object
- 204 No Content if asset not found

#### Create Asset (File Upload)
```
POST /v1/sites/{siteId}/assets
Content-Type: multipart/form-data

Form fields:
- file: binary file data (required)
- createdBy: string (optional)
```
**Response:** 
- 201 Created with Location header
- Location header contains URI of created resource
- Response body contains created Asset object
- Server stores file with GUID-based filename
- Server sets Filename, MimeType, Url, and CreatedDate

#### Create Asset (URL Reference)
```
POST /v1/sites/{siteId}/assets
Content-Type: application/json

{
  "filename": "string (required)",
  "mimeType": "string (required)",
  "url": "string (required)",
  "createdBy": "string (optional)"
}
```
**Response:** 
- 201 Created with Location header
- Location header contains URI of created resource
- Response body contains created Asset object
- Server sets CreatedDate

#### Get Asset File Content
```
GET /v1/sites/{siteId}/assets/{assetId}/file
```
**Response:** 
- 200 OK with file content
- Content-Type header set to asset's MimeType
- Content-Disposition header for file download
- 204 No Content if asset not found

#### Update Asset
```
PUT /v1/sites/{siteId}/assets/{assetId}
Content-Type: application/json

{
  "filename": "string (required)",
  "mimeType": "string (required)",
  "url": "string (required)"
}
```
**Response:** 
- 200 OK with empty response body
- 204 No Content if asset not found

#### Delete Asset
```
DELETE /v1/sites/{siteId}/assets/{assetId}
```
**Response:** 
- 200 OK with empty response body
- Deletes both database record and physical file
- 204 No Content if asset not found

## HTTP Status Codes

The API uses standard HTTP status codes:

- **200 OK** - Successful GET, PUT, or DELETE operation
- **201 Created** - Successful POST operation, includes Location header
- **204 No Content** - Resource not found (instead of 404 Not Found)
- **400 Bad Request** - Validation error or business rule violation
- **500 Internal Server Error** - Unhandled server exception

## Response Formats

### Successful POST Response
- Status: 201 Created
- Location header: URI of newly created resource
- Body: Created resource object

### Successful PUT Response
- Status: 200 OK
- Body: Empty

### Successful DELETE Response
- Status: 200 OK
- Body: Empty

### Validation Error Response
- Status: 400 Bad Request
- Body: Array of error strings
```json
[
  "Name is required",
  "Description must not exceed 255 characters"
]
```

### Not Found Response
- Status: 204 No Content
- Body: Empty

## Validation Rules

### Site Validation
- `Name`: Required, maximum length 255 characters
- `Description`: Maximum length 255 characters

### Page Validation
- `Title`: Required, maximum length 255 characters
- `Body`: Required, no maximum length (varchar max)
- `SiteId`: Must reference existing Site

### Asset Validation
- `MimeType`: Must be one of: `image/jpeg`, `image/png`, `application/pdf`
- File size: Maximum 30 MB
- `SiteId`: Must reference existing Site

## Audit Fields and Timestamps

### Server-Managed Fields
All timestamp fields are automatically set by the server and are not accepted from client requests:
- `CreatedDate` - Set on creation
- `UpdatedDate` - Set on creation and update
- `PublishedDate` - Set based on `IsPublished` flag in request

### Client-Provided Fields
Audit "by" fields are optional string identifiers provided by the client in request bodies:
- `CreatedBy` - Provided in POST requests
- `UpdatedBy` - Provided in PUT requests

### Update Behavior
PUT operations replace the entire entity, updating:
- All modifiable fields from request body
- `UpdatedDate` (set by server)
- `UpdatedBy` (provided by client)

## Future Enhancements

The following features are planned for future implementation:

1. **Pagination** - Limit and offset parameters for list endpoints
2. **Filtering** - Query parameters to filter results
3. **Sorting** - Query parameters to specify sort order
4. **PATCH Operations** - Partial updates for entities
5. **Azure Blob Storage** - Cloud-based file storage for Assets
6. **404 Not Found** - May replace 204 No Content for missing resources

## Not Supported

- **PATCH Operations** - Only PUT is supported for updates at this time
- **Pagination** - All list endpoints return complete result sets
- **Filtering** - No query parameters for filtering
- **Sorting** - Results returned in natural order
