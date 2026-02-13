# Feature Specification: AgentCMS Admin Portal

**Feature Branch**: `001-admin-portal`  
**Created**: February 13, 2026  
**Status**: Draft  
**Input**: User description: "The AgentCMS admin portal enables content managers to manage site content (Sites, Pages, Assets) through a focused, intuitive web interface. Primary users are content managers whose top goals are: 1) create and maintain site pages quickly and reliably, 2) manage assets (upload or link images, PDFs, static HTML), and 3) publish content with clear visibility into publication state. The portal must present workflows that let these users complete those goals with minimal training and minimal cognitive friction."

## Clarifications

### Session 2026-02-13

- Q: When save, publish, or upload actions fail, what should happen to the user's entered data and how should retry work? → A: Show error message, preserve entered data, and allow retry with a "Try Again" action
- Q: What should happen when asset uploads fail due to size limits, unsupported MIME types, or other validation issues? → A: Validate file size and type before upload starts; reject immediately with specific message if invalid
- Q: How should the system handle concurrent edits to the same page by multiple managers? → A: Allow concurrent edits; last save wins; warn user before saving if page was modified by someone else since they opened it
- Q: What authorization model should the admin portal use for content managers? → A: All authenticated content managers have full access to all sites, pages, and assets (no per-site or per-page restrictions)
- Q: What accessibility standard and conformance level should the admin portal meet? → A: WCAG 2.1 Level AA (mid-level conformance - recommended standard for most web applications)
- Q: For US1 (Create and Publish a Page), should publishing use scheduled dates or a simple flag? → A: Use a simple yes/no isPublished boolean flag; no need for scheduled publishing or publishedDate field
- Q: For US3 (Associate Assets with Pages), do content managers need to link assets to specific pages? → A: No, this is no longer a requirement; remove page-asset associations from scope

## User Scenarios & Testing

### User Story 1 - Create and Publish a Page (Priority: P1)

A content manager needs to create a new page with a title and body content, then set a publish flag to make it visible. The manager must see clear confirmation that the page is published and understand its current publication state.

**Why this priority**: This is the core value proposition of the admin portal - enabling content managers to create and publish pages. Without this capability, the portal has no minimum viable function.

**Independent Test**: Can be fully tested by creating a page record, toggling the isPublished flag, and verifying the publication state. Delivers immediate value as a standalone content creation and publishing tool.

**Acceptance Scenarios**:

1. **Given** the manager is on the page creation screen, **When** they enter a title and body, **Then** the page is saved with isPublished = false (draft) by default
2. **Given** the manager has created a draft page, **When** they set isPublished = true, **Then** the page is published and visible to site visitors
3. **Given** the manager is editing a published page, **When** they set isPublished = false, **Then** the page is unpublished (draft) and no longer visible to site visitors
4. **Given** the manager has saved a page, **When** they view the page details, **Then** they see title, body, isPublished status (Published/Draft), and created/updated timestamps with createdBy/updatedBy metadata

---

### User Story 2 - Upload and Manage Assets (Priority: P1)

A content manager needs to add images or documents to the system by uploading files or providing URLs, then view and manage these assets.

**Why this priority**: Assets are essential for rich content creation. Content managers need to upload images and documents as part of their content management workflow. This story is independently testable and delivers standalone asset library functionality.

**Independent Test**: Can be tested by uploading a file via file picker, creating an asset from a URL, and viewing the asset list with filename, MIME type, URL, createdDate, and createdBy. Delivers standalone asset library functionality.

**Acceptance Scenarios**:

1. **Given** the manager is on the assets screen, **When** they upload a file (image, PDF, or static HTML), **Then** an asset record is created showing filename, detected MIME type, storage URL, createdDate, and createdBy
2. **Given** the manager is on the assets screen, **When** they provide an external URL and confirm, **Then** an asset record is created linking to that URL with appropriate metadata
3. **Given** multiple assets exist, **When** the manager views the asset list, **Then** they see all assets with their filename, MIME type, URL, createdDate, and createdBy in a scannable list

---

### User Story 3 - Create and Edit Sites (Priority: P1)

A content manager needs to create site records with a name and description, and edit these properties to organize pages and assets under logical site groupings.

**Why this priority**: Sites provide the organizational structure for pages and assets. While simpler than page management, it's a foundational requirement for multi-site content management.

**Independent Test**: Can be tested by creating a site with name and description, editing those properties, and viewing the site list. Delivers standalone site configuration capability.

**Acceptance Scenarios**:

1. **Given** the manager is on the site creation screen, **When** they enter a required site name and optional description, **Then** a site record is created with a unique ID
2. **Given** a site exists, **When** the manager edits the site name or description, **Then** the changes are saved and visible immediately
3. **Given** multiple sites exist, **When** the manager views the site list, **Then** they see each site's name and description

---

### Edge Cases

- What happens when a manager tries to create a page without a required title?
- How does the system handle uploading a file with an unsupported or unrecognized MIME type?
- How does the system handle a manager attempting to upload a file that exceeds size limits?
- What happens when a manager tries to create a site without a name?
- What happens when a manager provides an invalid or unreachable URL when creating an asset?
- How does the system handle concurrent edits to the same page by multiple managers?

### Error Handling

When save, publish, or upload actions fail:
- The system must preserve all user-entered data in the form
- The system must display a clear error message explaining what went wrong
- The system must provide a "Try Again" action that re-attempts the operation with the preserved data
- The user must not be required to re-enter any data after a failure

### Concurrent Edit Handling

When multiple managers edit the same page:
- The system allows concurrent editing without locking
- Last save wins (most recent save overwrites previous changes)
- Before saving, if the page was modified by another user since the current user opened it, the system must warn the user with a message indicating who made changes and when
- The warning gives the user the choice to proceed with overwrite or cancel and refresh to see the other user's changes

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow content managers to create page records with a required title, optional body, and isPublished boolean flag
- **FR-002**: System MUST allow content managers to toggle the isPublished flag to control page visibility (true = published, false = draft)
- **FR-003**: System MUST allow content managers to unpublish a page by setting isPublished = false
- **FR-004**: System MUST display page metadata including id (read-only), siteId (read-only), title, body, isPublished, createdDate, updatedDate, createdBy, and updatedBy
- **FR-005**: System MUST allow content managers to upload files (images, PDFs, static HTML) to create asset records
- **FR-006**: System MUST allow content managers to create asset records by providing a URL
- **FR-007**: System MUST detect and store the MIME type of uploaded files
- **FR-008**: System MUST display asset metadata including id (read-only), siteId (read-only), filename, MIME type, URL, createdDate, and createdBy
- **FR-009**: System MUST allow content managers to create site records with a required name and optional description
- **FR-012**: System MUST allow content managers to edit site name and description
- **FR-013**: System MUST display site metadata including id (read-only), name, and description
- **FR-014**: System MUST record createdBy and updatedBy metadata when pages are created or modified
- **FR-015**: System MUST record createdDate and updatedDate timestamps automatically for pages
- **FR-016**: System MUST record createdDate and createdBy metadata for assets
- **FR-017**: System MUST provide clear, immediate feedback when save, publish, or upload actions succeed or fail
- **FR-018**: System MUST present uniform interaction patterns across Sites, Pages, and Assets interfaces
- **FR-017**: System MUST validate that page title is provided before saving
- **FR-018**: System MUST validate that site name is provided before saving
- **FR-019**: System MUST validate file size and MIME type before initiating file upload
- **FR-020**: System MUST reject files that exceed size limits or have unsupported MIME types immediately with a specific error message before upload begins
- **FR-021**: System MUST allow concurrent editing of the same page by multiple managers
- **FR-022**: System MUST detect when a page has been modified by another user since the current user opened it for editing
- **FR-023**: System MUST warn the user before saving if another user has modified the page, displaying who made changes and when, and allow the user to proceed or cancel
- **FR-024**: System MUST conform to WCAG 2.1 Level AA accessibility standards for all user interfaces (Sites, Pages, Assets screens)

### Key Entities

- **Site**: Represents a logical grouping of pages and assets. Key attributes: unique identifier, name (required), description (optional). A site contains multiple pages and assets.
- **Page**: Represents a content page within a site. Key attributes: unique identifier, site identifier, title (required), body content (optional), isPublished boolean flag, creation/update timestamps, creation/update user metadata.
- **Asset**: Represents an uploaded file or linked external resource. Key attributes: unique identifier, site identifier, filename, MIME type, storage or external URL, creation timestamp, creation user metadata.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Content managers can create, edit, and publish a page in under 3 minutes for straightforward content (title and body only)
- **SC-002**: First-time users can complete a core P1 task (create and publish a page) with a task completion rate of 90%
- **SC-003**: Page load performance for editorial pages meets a p95 page load time of under 3 seconds measured in realistic network conditions
- **SC-004**: Editorial actions (save, publish, upload) provide feedback to the user within 2 seconds under normal operating conditions
- **SC-005**: Publication state changes (published vs. draft) are unambiguous and visible to content managers immediately after action
- **SC-006**: Asset upload and URL linking operations complete successfully for supported file types and valid URLs with a success rate above 95%
- **SC-007**: Content managers can upload an asset in under 2 minutes
- **SC-008**: All user interfaces conform to WCAG 2.1 Level AA standards as validated by automated accessibility testing tools and manual keyboard navigation testing

### Validation Approach

- **SC-001, SC-007**: Measured via task completion timing during user acceptance testing with representative content
- **SC-002**: Measured via first-time user testing sessions with task completion tracking and minimal instruction
- **SC-003**: Measured via browser performance monitoring tools (e.g., Lighthouse, WebPageTest) under controlled and real-world network conditions; requires instrumentation in deployed environment
- **SC-004**: Measured via client-side performance monitoring and server response time logging
- **SC-005**: Verified through usability testing and user feedback surveys asking managers to interpret publication state after actions
- **SC-006**: Measured via server-side success/failure logging for upload and asset creation operations
- **SC-008**: Validated via automated accessibility testing tools (e.g., axe, Lighthouse accessibility audit) and manual testing with keyboard-only navigation and screen reader compatibility verification

## Assumptions

- Content managers have basic web browser skills and understand concepts like "publish," "upload," and "schedule"
- All authenticated content managers have full access to all sites, pages, and assets within the admin portal (no per-site, per-page, or role-based access restrictions in this version)
- Content managers have appropriate authentication credentials to access the admin portal (authentication mechanism is out of scope for this spec)
- Asset storage and delivery infrastructure exists or will be provided (implementation detail for Plan phase)
- The system supports standard web file upload mechanisms for assets
- Publication state (isPublished) is a simple boolean flag that content managers toggle directly
- "Unpublishing" a page is accomplished by setting isPublished = false, not by deleting the page
- Asset file size limits and supported MIME types are determined by product and infrastructure teams; the portal will enforce those limits (specific limits are implementation details)
- The portal is for authenticated internal users (content managers); public-facing site rendering is out of scope
- Localization, versioning, rollback, and advanced governance workflows are explicitly out of scope and deferred to future features
- Each page and asset belongs to exactly one site; multi-site associations are not required in this version

## Out of Scope

- Bulk editing of multiple pages or assets at once
- Localization and multi-language content management
- Rollback or versioned audit UI for tracking historical changes to pages
- Advanced governance workflows (approval chains, content review cycles)
- Public-facing rendering or preview of published pages (this spec covers the admin portal only)
- Content migration or import tools
- Advanced asset management features (tagging, categorization, search)
- User and permission management within the admin portal
- Granular authorization (per-site or role-based access control) - all authenticated content managers have full access in this version
- Analytics or reporting on content performance
- WYSIWYG rich text editing (body field is plain text or basic formatted text as determined in Plan phase)

## Dependencies

- Authentication and authorization system must be in place to control access to the admin portal
- Asset storage infrastructure (file storage service or external URL validation) must be available
- Database or data persistence layer must support the Site, Page, and Asset entities with required fields

## Open Questions

[No open questions at this time - all clarifications needed are marked inline with [NEEDS CLARIFICATION] tags]
