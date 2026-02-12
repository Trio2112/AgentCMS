<!--
Sync Impact Report (2026-02-12)
- Created: .specify/memory/constitution.md (was missing)
- Templates requiring updates: none (this file is the project-specific fill of the template)
- Notes: This constitution captures minimum API requirements for AgentCMS (headless CMS API).
-->

# AgentCMS Constitution
<!-- Headless CMS API constitution for AgentCMS -->

## Core Principles

### 1) API-First, Contract-Driven
AgentCMS is a **headless CMS** and MUST be usable purely via HTTP APIs.

Minimum requirements:
- MUST expose a consistent JSON API with predictable resource shapes.
- MUST document the API using OpenAPI (Swagger) and keep it in sync with behavior.
- MUST support request tracing via correlation IDs (accept and emit a request ID).

### 2) Secure, Multi-Tenant by Default
Security and tenant isolation are not optional.

Minimum requirements:
- MUST authenticate every non-public request via API key
- MUST isolate tenants (org/project/spaces) so content and assets cannot leak across tenants.

### 3) Content Modeling + Content Lifecycle
A headless CMS MUST support structured content models and a publish workflow.

Minimum requirements:
- MUST support defining content types (models) with fields, validation, and required/optional rules.
- MUST support entries with lifecycle states (at least `draft` and `published`).
- SHOULD support scheduling publish/unpublish (can be a later enhancement, but the design must not preclude it).


### 4) Queryable Delivery Experience
Consumers need to fetch content reliably and efficiently.

Minimum requirements:
- MUST provide read access to **published** content with stable identifiers (id, slug, or both).
- MUST support pagination for list endpoints.
- MUST support basic filtering and sorting.

### 5) Integrations, Auditability, and Backwards Compatibility
AgentCMS must integrate into real systems and remain stable over time.

Minimum requirements:
- MUST support assets/media management (upload, metadata, retrieval).
- MUST version the API and provide a deprecation policy for breaking changes.

## Minimum API Requirements
These are the minimum capabilities the AgentCMS API MUST provide to qualify as a usable headless CMS.

### Tenancy + Auth
- Tenants/spaces/projects to scope all content and assets.

### Content Types (Models)
- Create/read/update/delete content types.
- Field definitions (string/number/boolean/date/rich text/reference/list) and validation rules.
- Model versioning or safe evolution rules (e.g., adding fields is non-breaking; removing/renaming requires migration).

### Content Entries
- Create/read/update/delete entries.
- Draft vs published state (publish/unpublish operations).
- Slug/identifier support for delivery.

### Delivery API (Read)
- Read published entries by id/slug.
- List published entries by content type.
- Pagination (`page`/`pageSize` or cursor-based), filtering, and sorting.
- Relationship/reference resolution strategy (include/expand or follow links).

### Assets / Media
- Upload assets (direct upload or pre-signed URL approach).
- Asset metadata (filename, size, content type, alt text, optional focal point).
- Retrieve assets via stable URLs or asset API.

### Cross-Cutting API Standards
- Consistent resource naming, status codes, and error responses.
- Idempotency for unsafe operations SHOULD be supported (e.g., `Idempotency-Key` for publish, asset uploads).
- Stable IDs (UUID/ULID or equivalent).

## Development Workflow & Quality Gates
- Every endpoint MUST have contract coverage (OpenAPI + integration test or equivalent).
- Management operations (writes) MUST have authorization tests for at least: allowed, denied, cross-tenant denied.
- Changes that alter API shapes MUST include:
  - OpenAPI update
  - backward-compat assessment
  - migration notes (if applicable)

## Governance
- This constitution supersedes all other practices and templates in `.specify/`.
- Amendments require:
  - explicit PR updating this file
  - version bump
  - rationale and (if breaking) migration/deprecation plan

**Version**: 1.0.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
