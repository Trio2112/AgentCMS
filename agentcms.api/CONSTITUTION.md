# AgentCMS API Constitution

## Purpose
AgentCMS is a headless content management system that provides RESTful API access to content and configuration data. The API serves the AgentCMS configuration portal (web frontend) and external client systems that store and manage content (HTML, PDF, images, etc.) for display on their own portals.

## Architectural Principles:

- **Multi-tenant by Design:** Site-based multi-tenancy with complete content isolation between sites. No cross-site data sharing.
- **RESTful Standards:** Follow REST conventions for all CRUD operations across all resources.
- **Relational Data Model:** Sites contain Pages and Assets in parent-child relationships. Pages use fixed schemas; no dynamic/flexible field structures.

## Technology Constraints:

- **Storage:** SQL Server (SQL Express for local development, Azure SQL for production).
- **API Standards:** Standard HTTP status codes, detailed validation error messages, support for API versioning when breaking changes occur.

## Versioning Strategy:

- **Method:** URL-based versioning (e.g., `/v1/`, `/v2/`) included in all API endpoints.
- **Versioning Trigger:** New API versions are created only when breaking changes to the client contract are necessary.
- **Version Support:** All previous API versions will continue to be supported indefinitely to maintain backward compatibility and allow clients to migrate at their own pace.
- **Migration Path:** Clients will be notified of breaking changes with advance notice and clear migration documentation.

## Operational Requirements:

- Health check endpoints for monitoring
- Basic error and exception logging

## Development Approach:

- **Testing:** No unit tests, automated testing, or test infrastructure will be created as part of this application. Testing implementation is deferred to a later phase.
- **AI Agent Focus:** AI agents will not create or worry about tests during development.

## Project Scope:

- **API Only:** This project (`agentcms.api`) contains exclusively the RESTful API endpoints and their accompanying documentation.
- **No Front-End Components:** Frontend application code, UI components, and client-side logic are not included in this project and will be developed separately.

## Out of Scope (Future Enhancements):

- Authentication and authorization
- Import/export functionality
- Advanced features
- Comprehensive testing framework

## Performance Expectations:
General performance standards; not designed for high-volume scenarios.