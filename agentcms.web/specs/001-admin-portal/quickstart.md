# Quickstart: AgentCMS Admin Portal

**Feature**: AgentCMS Admin Portal  
**Date**: February 13, 2026  
**Purpose**: Setup instructions, test scenarios, and validation workflows for local development and testing

## Prerequisites

- **Node.js**: 20 LTS or later
- **npm**: 10+ or **yarn**: 1.22+ or **pnpm**: 8+
- **AgentCMS API**: Backend API running and accessible (default: `http://localhost:5000`)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the admin portal directory
cd admin-portal

# Install dependencies
npm install
# OR
yarn install
# OR
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Optional: Authentication token for development
VITE_AUTH_TOKEN=your-dev-token-here

# Optional: Feature flags
VITE_ENABLE_CONCURRENT_EDIT_WARNING=true
VITE_MAX_FILE_SIZE_MB=10
```

### 3. Start Development Server

```bash
npm run dev
# OR
yarn dev
# OR
pnpm dev
```

The admin portal will be available at `http://localhost:5173` (Vite default port).

### 4. Verify API Connection

Open the browser console and check for successful API connection:
- Navigate to `http://localhost:5173`
- Open DevTools → Network tab
- Look for successful requests to `/v1/sites` or other API endpoints
- If you see 401 errors, check authentication configuration

---

## Test Scenarios (P1 User Stories)

### Test Scenario 1: Create and Publish a Page (User Story 1)

**Objective**: Verify content managers can create, schedule, and publish pages.

**Steps**:
1. Navigate to Sites list → Select a site (or create one if empty)
2. Click "Pages" → Click "New Page"
3. Enter page title: "Test Page - Immediate Publish"
4. Enter body content: "This is a test page created for validation."
5. Set published date to **today's date and current time**
6. Click "Save"

**Expected Results**:
- Page is created with `isPublished = true`
- Page appears in the Pages list with "Published" badge (green)
- Page details show published date, createdDate, createdBy

**Variant 1: Scheduled Publishing**
- Set published date to **1 day in the future**
- Expected: `isPublished = false`, "Scheduled" badge (blue), shows future date

**Variant 2: Unpublish a Page**
- Open a published page for editing
- Clear the published date field (set to null)
- Save
- Expected: `isPublished = false`, "Unpublished" badge (grey), no published date shown

**Acceptance Criteria**: FR-001, FR-002, FR-003, FR-021

---

### Test Scenario 2: Upload and Manage Assets (User Story 2)

**Objective**: Verify content managers can upload files and create URL-based assets.

**Steps (File Upload)**:
1. Navigate to Sites list → Select a site
2. Click "Assets" → Click "Upload Asset"
3. Select a test image file (e.g., `test-image.jpg`, < 10MB)
4. Click "Upload"

**Expected Results**:
- File validation occurs **before** upload (check DevTools Network tab - no request if validation fails)
- Asset appears in Assets list with filename, MIME type (`image/jpeg`), thumbnail preview
- Asset shows createdDate and createdBy

**Variant 1: URL-Based Asset**
- Click "Link Asset from URL"
- Enter URL: `https://example.com/document.pdf`
- Click "Create"
- Expected: Asset created with `mimeType: application/pdf`, URL is displayed

**Variant 2: Invalid File (Validation)**
- Attempt to upload a 15MB file
- Expected: Error message **before upload starts** - "File size (15.00MB) exceeds 10MB limit"
- Attempt to upload an unsupported file type (e.g., `.exe`)
- Expected: Error message - "Unsupported file type: application/x-msdownload"

**Acceptance Criteria**: FR-005, FR-006, FR-007, FR-008, FR-022, FR-023

---

### Test Scenario 3: Associate Assets with Pages (User Story 3)

**Objective**: Verify content managers can link assets to pages and remove associations.

**Prerequisites**: At least 1 page and 2 assets exist in a site.

**Steps**:
1. Navigate to Pages list → Open a page for editing
2. Scroll to "Associated Assets" section → Click "Add Asset"
3. Select 2 assets from the asset library
4. Click "Add Selected Assets"

**Expected Results**:
- Assets appear in the page's "Associated Assets" list
- Each asset shows filename, MIME type, URL
- Associations are saved when page is saved

**Variant 1: Remove Asset Association**
- In the "Associated Assets" section, click "Remove" on one asset
- Save the page
- Expected: Asset is removed from page associations but still exists in Assets list

**Variant 2: View Assets from Asset Library**
- Navigate to Assets list
- Verify removed asset is still present (not deleted, only disassociated)

**Acceptance Criteria**: FR-009, FR-010

---

### Test Scenario 4: Create and Edit Sites (User Story 4)

**Objective**: Verify content managers can create and update site records.

**Steps**:
1. Navigate to Sites list → Click "New Site"
2. Enter site name: "Test Site for QA"
3. Enter description: "This site is for testing purposes."
4. Click "Save"

**Expected Results**:
- Site is created with unique ID
- Site appears in Sites list with name and description

**Variant 1: Edit Site**
- Click on the site from the list → Click "Edit"
- Change name to "Updated Test Site"
- Change description to "Description updated successfully"
- Click "Save"
- Expected: Changes are saved and visible immediately in list view

**Variant 2: Required Validation**
- Click "New Site"
- Leave name field empty
- Attempt to save
- Expected: Error message "Site name is required" appears below the name field

**Acceptance Criteria**: FR-011, FR-012, FR-013, FR-019, FR-020

---

## Edge Case Testing

### Concurrent Edit Detection (FR-024, FR-025, FR-026)

**Steps**:
1. Open a page for editing in **two browser tabs** (Tab A and Tab B)
2. In Tab A: Change title to "Modified in Tab A" → Save
3. In Tab B: Change title to "Modified in Tab B" → Click Save

**Expected Result**:
- Tab B shows a warning: "This page was modified by [user] at [time]. Your changes will overwrite theirs. Continue?"
- User can choose to proceed (overwrite) or cancel

### Error Handling with Retry (Clarification Requirement)

**Steps**:
1. Stop the backend API server (simulate network failure)
2. Create a new page and click "Save"

**Expected Result**:
- Error message appears: "Failed to save page. Please check your connection."
- Form data is **preserved** (title and body are not lost)
- "Try Again" button is displayed
3. Restart API server
4. Click "Try Again"

**Expected Result**:
- Page saves successfully without re-entering data

---

## Accessibility Testing Workflow

### Automated Testing (axe-core)

Run accessibility scans as part of E2E tests:

```bash
npm run test:e2e
```

This will run Playwright tests with axe-core integration, checking for WCAG 2.1 Level AA violations.

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements in logical order
- [ ] Shift+Tab navigates backwards
- [ ] Enter key activates buttons and submits forms
- [ ] Esc key closes modals
- [ ] Focus indicators are visible on all interactive elements

#### Screen Reader Testing
**Using NVDA (Windows) or VoiceOver (Mac)**:
- [ ] All form labels are read correctly
- [ ] Error messages are announced when validation fails
- [ ] Page title and headings are structured correctly (H1, H2, H3)
- [ ] Button purposes are clear ("Save Page", "Upload Asset", not just "Save", "Upload")
- [ ] Image assets have alt text or descriptive labels

#### Color Contrast
- [ ] Use browser DevTools or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] All text meets 4.5:1 contrast ratio (WCAG AA requirement)
- [ ] Publication state badges (Published/Scheduled/Unpublished) are distinguishable by more than color alone

---

## Performance Measurement

### Lighthouse CI Integration

Run Lighthouse audits locally:

```bash
npm run lighthouse
```

**Target Metrics** (SC-003):
- First Contentful Paint: < 2 seconds
- Time to Interactive: < 3 seconds
- Speed Index: < 3 seconds

### Manual Performance Testing

1. Open DevTools → Network tab → Throttle to "Fast 3G"
2. Navigate to Pages list for a site with 20+ pages
3. Measure: Page load time should be < 3 seconds (p95)

---

## Common Issues and Troubleshooting

### Issue: "Failed to fetch" errors on API calls

**Solution**: Check that:
- Backend API is running (`curl http://localhost:5000/health`)
- `VITE_API_BASE_URL` in `.env.local` is correct
- CORS is configured on the backend to allow frontend origin

### Issue: Authentication 401 errors

**Solution**:
- If auth is implemented, verify token is valid: `console.log(localStorage.getItem('authToken'))`
- Update `VITE_AUTH_TOKEN` in `.env.local`
- Check that API interceptor is attaching auth headers

### Issue: File upload fails with no error message

**Solution**:
- Check file size (must be < 10MB)
- Check file type (only `image/*`, `application/pdf`, `text/html` allowed)
- Verify backend endpoint accepts `multipart/form-data`

### Issue: Published date shows wrong timezone

**Solution**:
- Backend should store dates in UTC
- Frontend converts to local timezone for display
- Check browser timezone settings: `Intl.DateTimeFormat().resolvedOptions().timeZone`

---

## Running Tests

### Unit Tests

```bash
npm run test:unit
# OR with coverage
npm run test:unit -- --coverage
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/e2e/create-publish-page.spec.ts

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Debug mode
npm run test:e2e -- --debug
```

### Accessibility Tests

```bash
npm run test:a11y
```

---

## Deployment Checklist

Before deploying to staging/production:

- [ ] All P1 test scenarios pass
- [ ] No WCAG 2.1 AA violations in accessibility scan
- [ ] Lighthouse performance score >= 90
- [ ] Error handling and retry tested
- [ ] Concurrent edit warning tested
- [ ] Backend API has `publishedDate` field on Page entity (**CRITICAL**)
- [ ] Backend API has page-asset association endpoints (**CRITICAL**)
- [ ] Environment variables configured for production API URL
- [ ] Authentication integrated with production auth system

---

## Next Steps

After completing quickstart validation:

1. Run `/speckit.tasks` to generate implementation tasks
2. Begin Phase 1: Setup (project scaffolding)
3. Implement foundational components (API client, routing, auth)
4. Build features in priority order (P1 user stories 1-4)

For questions or issues, refer to:
- [plan.md](plan.md) - Technical decisions and architecture
- [data-model.md](data-model.md) - Entity structure and validation rules
- [research.md](research.md) - Technology choices and alternatives
- [contracts/](contracts/) - API endpoint specifications
