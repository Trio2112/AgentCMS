# Feature Specification: AgentCMS Admin Portal

**Feature Branch**: `001-admin-portal`  
**Created**: February 13, 2026  
**Status**: Draft  
**Input**: User description: "The AgentCMS admin portal enables content managers to manage site content (Sites, Pages, Assets) through a focused, intuitive web interface. Primary users are content managers whose top goals are: 1) create and maintain site pages quickly and reliably, 2) manage assets (upload or link images, PDFs, static HTML) and associate them with pages, and 3) schedule and publish content with clear visibility into publication state. The portal must present workflows that let these users complete those goals with minimal training and minimal cognitive friction."

## Clarifications

### Session 2026-02-13

- Q: When save, publish, or upload actions fail, what should happen to the user's entered data and how should retry work? → A: Show error message, preserve entered data, and allow retry with a "Try Again" action
- Q: What should happen when asset uploads fail due to size limits, unsupported MIME types, or other validation issues? → A: Validate file size and type before upload starts; reject immediately with specific message if invalid
- Q: How should the system handle concurrent edits to the same page by multiple managers? → A: Allow concurrent edits; last save wins; warn user before saving if page was modified by someone else since they opened it
- Q: What authorization model should the admin portal use for content managers? → A: All authenticated content managers have full access to all sites, pages, and assets (no per-site or per-page restrictions)

## User Scenarios & Testing

### User Story 1 - Create and Publish a Page (Priority: P1)

A content manager needs to create a new page with a title and body content, then publish it immediately or schedule it for future publication. The manager must see clear confirmation that the page is published and understand its current publication state.

**Why this priority**: This is the core value proposition of the admin portal - enabling content managers to create and publish pages. Without this capability, the portal has no minimum viable function.

**Independent Test**: Can be fully tested by creating a page record, setting a published date, and verifying the isPublished state reflects the scheduling logic. Delivers immediate value as a standalone content creation and publishing tool.

**Acceptance Scenarios**:

1. **Given** the manager is on the page creation screen, **When** they enter a title, body, and set a published date to today's date or earlier, **Then** the page is saved with isPublished = true and appears as published
2. **Given** the manager is editing an existing page, **When** they set the published date to a future date, **Then** the page is saved with isPublished = false and shows as scheduled
3. **Given** the manager is editing a published page, **When** they clear the published date field, **Then** the page is unpublished (isPublished = false) and no longer visible to site visitors
4. **Given** the manager has saved a page, **When** they view the page details, **Then** they see title, body, published date (or "Not Published"), isPublished status, and created/updated timestamps with createdBy/updatedBy metadata

---

### User Story 2 - Upload and Manage Assets (Priority: P1)

A content manager needs to add images or documents to the system by uploading files or providing URLs, then view and manage these assets to use them in pages.

**Why this priority**: Assets are essential for rich content creation. Content managers need to upload images and documents as part of their page authoring workflow. This story is independently testable and valuable without requiring page associations.

**Independent Test**: Can be tested by uploading a file via file picker, creating an asset from a URL, and viewing the asset list with filename, MIME type, URL, createdDate, and createdBy. Delivers standalone asset library functionality.

**Acceptance Scenarios**:

1. **Given** the manager is on the assets screen, **When** they upload a file (image, PDF, or static HTML), **Then** an asset record is created showing filename, detected MIME type, storage URL, createdDate, and createdBy
2. **Given** the manager is on the assets screen, **When** they provide an external URL and confirm, **Then** an asset record is created linking to that URL with appropriate metadata
3. **Given** multiple assets exist, **When** the manager views the asset list, **Then** they see all assets with their filename, MIME type, URL, createdDate, and createdBy in a scannable list

---

### User Story 3 - Associate Assets with Pages (Priority: P1)

A content manager needs to link uploaded assets (images, PDFs) to specific pages so those assets are available when the page is rendered or referenced.

**Why this priority**: This completes the basic content authoring workflow by connecting assets to pages. While technically dependent on Stories 1 and 2, it represents a distinct, testable capability required for a complete P1 feature set.

**Independent Test**: Can be tested by selecting a page, choosing one or more assets from the asset library, and verifying the association is saved and displayed. Delivers the ability to build complete pages with media.

**Acceptance Scenarios**:

1. **Given** a page exists and assets are available, **When** the manager associates one or more assets with the page, **Then** the associations are saved and visible when viewing the page details
2. **Given** a page has associated assets, **When** the manager removes an asset association, **Then** the asset is disassociated from the page but remains in the asset library
3. **Given** the manager is editing a page, **When** they view associated assets, **Then** they see each asset's filename, MIME type, and URL to confirm the correct associations

---

### User Story 4 - Create and Edit Sites (Priority: P1)

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
- What happens when a manager sets a published date to a past date on an unpublished page?
- How does the system handle a manager attempting to upload a file that exceeds size limits?
- What happens when a manager tries to create a site without a name?
- How does the system behave if a manager clears the published date on a page that is already unpublished?
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

- **FR-001**: System MUST allow content managers to create page records with a required title, optional body, and optional published date
- **FR-002**: System MUST compute and display isPublished status based on published date (true if published date is set and not in the future, false otherwise)
- **FR-003**: System MUST allow content managers to clear the published date on a page, resulting in isPublished = false
- **FR-004**: System MUST display page metadata including id (read-only), siteId (read-only), title, body, published date, isPublished, createdDate, updatedDate, createdBy, and updatedBy
- **FR-005**: System MUST allow content managers to upload files (images, PDFs, static HTML) to create asset records
- **FR-006**: System MUST allow content managers to create asset records by providing a URL
- **FR-007**: System MUST detect and store the MIME type of uploaded files
- **FR-008**: System MUST display asset metadata including id (read-only), siteId (read-only), filename, MIME type, URL, createdDate, and createdBy
- **FR-009**: System MUST allow content managers to associate one or more assets with a page
- **FR-010**: System MUST allow content managers to remove asset associations from a page without deleting the asset
- **FR-011**: System MUST allow content managers to create site records with a required name and optional description
- **FR-012**: System MUST allow content managers to edit site name and description
- **FR-013**: System MUST display site metadata including id (read-only), name, and description
- **FR-014**: System MUST record createdBy and updatedBy metadata when pages are created or modified
- **FR-015**: System MUST record createdDate and updatedDate timestamps automatically for pages
- **FR-016**: System MUST record createdDate and createdBy metadata for assets
- **FR-017**: System MUST provide clear, immediate feedback when save, publish, or upload actions succeed or fail
- **FR-018**: System MUST present uniform interaction patterns across Sites, Pages, and Assets interfaces
- **FR-019**: System MUST validate that page title is provided before saving
- **FR-020**: System MUST validate that site name is provided before saving
- **FR-021**: System MUST allow scheduled publishing by accepting future dates in the published date field
- **FR-022**: System MUST validate file size and MIME type before initiating file upload
- **FR-023**: System MUST reject files that exceed size limits or have unsupported MIME types immediately with a specific error message before upload begins
- **FR-024**: System MUST allow concurrent editing of the same page by multiple managers
- **FR-025**: System MUST detect when a page has been modified by another user since the current user opened it for editing
- **FR-026**: System MUST warn the user before saving if another user has modified the page, displaying who made changes and when, and allow the user to proceed or cancel

### Key Entities

- **Site**: Represents a logical grouping of pages and assets. Key attributes: unique identifier, name (required), description (optional). A site contains multiple pages and assets.
- **Page**: Represents a content page within a site. Key attributes: unique identifier, site identifier, title (required), body content (optional), published date (nullable, used for scheduling), computed isPublished flag, creation/update timestamps, creation/update user metadata. A page can have multiple associated assets.
- **Asset**: Represents an uploaded file or linked external resource. Key attributes: unique identifier, site identifier, filename, MIME type, storage or external URL, creation timestamp, creation user metadata. An asset can be associated with multiple pages.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Content managers can create, edit, and publish a page in under 3 minutes for straightforward content (title and body only)
- **SC-002**: First-time users can complete a core P1 task (create and publish a page) with a task completion rate of 90%
- **SC-003**: Page load performance for editorial pages meets a p95 page load time of under 3 seconds measured in realistic network conditions
- **SC-004**: Editorial actions (save, publish, upload) provide feedback to the user within 2 seconds under normal operating conditions
- **SC-005**: Publication state changes (scheduled vs. published vs. unpublished) are unambiguous and visible to content managers immediately after action
- **SC-006**: Asset upload and URL linking operations complete successfully for supported file types and valid URLs with a success rate above 95%
- **SC-007**: Content managers can upload an asset and associate it with a page in under 2 minutes

### Validation Approach

- **SC-001, SC-007**: Measured via task completion timing during user acceptance testing with representative content
- **SC-002**: Measured via first-time user testing sessions with task completion tracking and minimal instruction
- **SC-003**: Measured via browser performance monitoring tools (e.g., Lighthouse, WebPageTest) under controlled and real-world network conditions; requires instrumentation in deployed environment
- **SC-004**: Measured via client-side performance monitoring and server response time logging
- **SC-005**: Verified through usability testing and user feedback surveys asking managers to interpret publication state after actions
- **SC-006**: Measured via server-side success/failure logging for upload and asset creation operations

## Assumptions

- Content managers have basic web browser skills and understand concepts like "publish," "upload," and "schedule"
- All authenticated content managers have full access to all sites, pages, and assets within the admin portal (no per-site, per-page, or role-based access restrictions in this version)
- Content managers have appropriate authentication credentials to access the admin portal (authentication mechanism is out of scope for this spec)
- Asset storage and delivery infrastructure exists or will be provided (implementation detail for Plan phase)
- The system supports standard web file upload mechanisms for assets
- Publication state (isPublished) is computed based on the published date being set and not in the future; no separate manual toggle is needed
- "Unpublishing" a page is accomplished by clearing the published date, not by deleting the page
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
- The system must have a mechanism to determine "current date/time" for evaluating scheduled publishing logic

## Open Questions

[No open questions at this time - all clarifications needed are marked inline with [NEEDS CLARIFICATION] tags]
