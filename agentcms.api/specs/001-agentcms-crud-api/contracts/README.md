# API Contracts

**Feature**: AgentCMS CRUD API  
**API Version**: v1  
**Date**: 2026-02-12

## Overview

This directory contains the OpenAPI specification and versioning policy for the AgentCMS CRUD API.

## Files

- **`openapi.yaml`**: Complete OpenAPI 3.0 specification
- **`README.md`**: This file (versioning policy and usage guide)

## API Versioning Policy

### Version Strategy

AgentCMS uses **URL-based versioning** with the format `/v{major}` (e.g., `/v1/sites`).

**Current Version**: `v1`

### Version Lifecycle

1. **Active**: Current version receiving new features and bug fixes
2. **Deprecated**: Previous version maintained for backward compatibility (6-month support window)
3. **Retired**: Version removed from API (no longer accessible)

### Breaking vs Non-Breaking Changes

**Non-Breaking Changes** (can be added to existing version):
- Adding new optional fields to request bodies
- Adding new fields to response bodies
- Adding new endpoints
- Adding new query parameters (optional)
- Relaxing validation rules

**Breaking Changes** (require new major version):
- Removing or renaming fields in request/response
- Changing field types (e.g., string → number)
- Making optional fields required
- Removing endpoints
- Changing URL structure
- Changing HTTP methods for existing endpoints
- Changing status code semantics

### Deprecation Process

When introducing a breaking change:

1. **Announce**: Document deprecation 6 months in advance
2. **Version**: Release new major version (e.g., v2) alongside existing version
3. **Signal**: Add `X-Deprecated-Version: true` header to all responses in deprecated version
4. **Support**: Maintain deprecated version for 6 months minimum
5. **Retire**: Remove deprecated version after support window expires

**Example Deprecation Header**:
```http
HTTP/1.1 200 OK
X-Deprecated-Version: true
X-Deprecation-Notice: API v1 will be retired on 2026-08-12. Migrate to v2.
X-API-Version: v1
```

### Version Documentation

Each version MUST maintain:
- Complete OpenAPI specification
- Migration guide (for major version changes)
- Changelog with breaking/non-breaking change annotations

## API Standards

### Base URL
```
https://localhost:5001/v1
```

### Authentication

**Current (v1)**: No authentication required (local development only)

**Future**: API key via `Authorization` header
```http
Authorization: Bearer {api-key}
```

### Content Types

**Request**:
- `application/json` (default)
- `multipart/form-data` (asset uploads only)

**Response**:
- `application/json` (default)
- `application/octet-stream` (asset file downloads)

### Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200 OK** | Success | GET, PUT, DELETE operations |
| **201 Created** | Resource created | POST operations (includes `Location` header) |
| **204 No Content** | Resource not found | GET operations (non-standard, per spec) |
| **400 Bad Request** | Validation error | Invalid input, business rule violation |
| **500 Internal Server Error** | Server error | Unhandled exceptions |

**Note**: This API uses `204 No Content` for "not found" scenarios instead of the typical `404 Not Found`. This deviates from REST standards and may surprise consumers. See [spec.md](../spec.md) for rationale.

### Error Response Format

```json
{
  "error": "Validation failed",
  "details": {
    "Title": ["The Title field is required."],
    "MimeType": ["MIME type application/zip is not allowed"]
  }
}
```

**Fields**:
- `error` (string): Human-readable error summary
- `details` (object): Field-level validation errors (key = field name, value = error array)

### Pagination

**Current (v1)**: Not implemented

**Future (v2)**: Query parameters
- `page` (integer, default 1): Page number
- `pageSize` (integer, default 50, max 100): Items per page

**Response** (future):
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 50,
  "totalItems": 250,
  "totalPages": 5
}
```

### Filtering

**Query Parameters**:
- `isPublished` (boolean): Filter pages by publish status
  - `true`: Only published pages (PublishedDate IS NOT NULL)
  - `false`: Only draft pages (PublishedDate IS NULL)
  - Omitted: All pages

### Correlation ID

**Request Header**:
```http
X-Request-ID: {client-generated-uuid}
```

**Response Header** (echoed back):
```http
X-Request-ID: {same-uuid}
```

If client does not provide `X-Request-ID`, server generates one and includes in response.

### Timestamps

All timestamps use **ISO 8601 format** in **UTC timezone**:
```json
{
  "createdDate": "2026-02-12T15:30:00Z",
  "updatedDate": "2026-02-12T16:45:00Z"
}
```

## Changelog

### v1.0.0 (2026-02-12)
- Initial release
- Sites resource (CRUD)
- Pages resource (CRUD with publish workflow)
- Assets resource (upload, list, delete, download)
- Multi-tenant isolation via `siteId` route parameter

## Future Roadmap

### v1.x (Minor Updates)
- Pagination for list endpoints
- Search/filtering enhancements
- Bulk operations (delete multiple pages)

### v2.0 (Breaking Changes)
- API key authentication (breaking: all endpoints require auth)
- Change 204 to 404 for not-found responses (breaking: status code change)
- Add versioning/audit history (breaking: schema changes)
- Add dynamic content types (breaking: new resource model)

## Testing

Use the OpenAPI spec to:
1. Generate client SDKs (e.g., `openapi-generator`)
2. Validate API responses in integration tests
3. Generate Postman collections
4. Enable Swagger UI for interactive testing

**Swagger UI** (when API running):
```
https://localhost:5001/swagger/index.html
```

## Support

- **API Issues**: File issue in repository
- **Migration Questions**: See migration guides for each version
- **Feature Requests**: Propose in repository discussions
