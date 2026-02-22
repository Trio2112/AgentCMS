# Quickstart: AgentCMS Admin Portal

**Feature**: AgentCMS Admin Portal  
**Date**: February 13, 2026  
**Purpose**: Setup instructions, test scenarios, and validation workflows for local development and testing

**Scope Note**: Pages use simple isPublished boolean toggle. Assets are managed independently (no page-asset associations).

## Prerequisites

- **Node.js**: 20 LTS or later
- **npm**: 10+ or **yarn**: 1.22+ or **pnpm**: 8+
- **AgentCMS API**: Backend API running and accessible (default: `https://localhost:5001`)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to the admin portal directory
cd agentcms.web

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
VITE_API_BASE_URL=https://localhost:5001

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

**Objective**: Verify content managers can create pages and toggle publish/draft status.

**Steps**:
1. Navigate to Sites list → Select a site (or create one if empty)
2. Click "Pages" → Click "New Page"
3. Enter page title: "Test Page - Published"
4. Enter body content: "This is a test page created for validation."
5. Check the "Publish" checkbox (or toggle to Published)
6. Click "Save"

**Expected Results**:
- Page is created with `isPublished = true`
- Page appears in the Pages list with "Published" badge (green)
- Page details show title, body, isPublished=true, createdDate, createdBy

**Variant 1: Create Draft Page**
- Leave "Publish" checkbox unchecked (or toggle to Draft)
- Expected: `isPublished = false`, "Draft" badge (grey)

**Variant 2: Toggle Publication Status**
- Open a published page for editing
- Uncheck "Publish" checkbox (or toggle to Draft)
- Save
- Expected: `isPublished = false`, "Draft" badge (grey)
- Re-open the page, check "Publish" checkbox
- Save
- Expected: `isPublished = true`, "Published" badge (green)

**Acceptance Criteria**: FR-001, FR-002, FR-003

---

### Test Scenario 2: Upload and Manage Assets (User Story 2)

**Objective**: Verify content managers can upload files, create assets from URLs, and view asset metadata.

**Steps**:
1. Navigate to Sites list → Select a site
2. Click "Assets" → Click "Upload Asset"
3. **File Upload Test**:
   - Drag and drop an image file (e.g., `test-image.jpg`, <10MB)
   - OR click file picker and select a file
   - Expected: Upload progress indicator appears
   - Expected: Asset created with filename, MIME type (e.g., `image/jpeg`), storage URL, createdDate, createdBy
4. **URL Asset Test**:
   - Click "Add from URL"
   - Enter external URL: `https://example.com/sample.pdf`
   - Click "Add"
   - Expected: Asset created with URL, MIME type inferred, createdDate, createdBy
5. **View Asset List**:
   - Navigate to Assets list
   - Expected: See all assets with filename, MIME type, URL, createdDate, createdBy

**Expected Results**:
- Uploaded files create asset records with detected MIME type
- External URLs create asset records with provided URL
- Asset list displays all metadata in scannable format

**Variant 1: File Validation - Size Limit**
- Attempt to upload a file >10MB
- Expected: Immediate error message "File size must be less than 10MB"
- Expected: Upload does not begin

**Variant 2: File Validation - MIME Type**
- Attempt to upload an unsupported file type (e.g., `.exe`, `.zip`)
- Expected: Immediate error message "File type not supported. Allowed: JPEG, PNG, GIF, PDF, HTML"
- Expected: Upload does not begin

**Acceptance Criteria**: FR-005, FR-006, FR-007, FR-008, FR-019, FR-020

---

### Test Scenario 3: Create and Edit Sites (User Story 3, formerly US4)

**Objective**: Verify content managers can create sites and edit site properties.

**Steps**:
1. Navigate to Sites list
2. Click "New Site"
3. Enter site name: "Test Site"
4. Enter description: "This is a test site for validation purposes"
5. Click "Save"

**Expected Results**:
- Site created with unique ID
- Site appears in Sites list with name and description
- Site details show id (read-only), name, description

**Variant 1: Edit Site**
- Open a site for editing
- Change name to "Updated Test Site"
- Change description to "Updated description"
- Save
- Expected: Changes persist and display immediately in site list

**Variant 2: Required Field Validation**
- Click "New Site"
- Leave name field empty
- Attempt to save
- Expected: Validation error "Site name is required"
- Expected: Site not created

**Acceptance Criteria**: FR-009, FR-010, FR-011, FR-018

---

## Edge Case Testing

### Concurrent Edit Detection (FR-021, FR-022, FR-023)

**Objective**: Verify warning when multiple users edit the same page.

**Steps** (requires two browser sessions):
1. **Browser A**: Open a page for editing
2. **Browser B**: Open the same page for editing
3. **Browser B**: Modify title, save successfully
4. **Browser A**: Modify body (without refreshing), attempt to save
5. **Expected**: Warning dialog appears: "Warning: This page was modified by [user] at [time]. Your changes will overwrite theirs. Proceed?"
6. **Browser A**: Click "Cancel"
7. **Expected**: Changes not saved, page remains open for editing
8. **Browser A**: Refresh page to see Browser B's changes
9. **Browser A**: Make changes again, save
10. **Expected**: No warning (page is now up-to-date)

**Acceptance Criteria**: FR-021, FR-022, FR-023

---

### Error Handling and Recovery (FR-015)

**Objective**: Verify data preservation and retry functionality when operations fail.

**Steps** (requires simulating API failure):
1. Create or edit a page with title "Error Test Page" and body content
2. Simulate API failure (disconnect network or stop backend API)
3. Attempt to save
4. **Expected**:
   - Error message displayed: "Failed to save page. Please try again."
   - Form data preserved (title and body still filled in)
   - "Try Again" button visible
5. Restore API connection
6. Click "Try Again"
7. **Expected**: Page saves successfully, no data re-entry required

**Acceptance Criteria**: FR-015

---

## Accessibility Testing (FR-024)

### Keyboard Navigation Test

**Objective**: Verify all functionality accessible via keyboard only.

**Steps**:
1. Navigate to admin portal
2. Use **Tab** key to move between interactive elements
3. Use **Shift+Tab** to move backwards
4. Use **Enter** to activate buttons and links
5. Use **Escape** to close modals and dialogs
6. Use **Arrow keys** to navigate lists and tables

**Expected Results**:
- All interactive elements reachable via keyboard
- Focus indicator visible on focused element
- Modals trap focus (Tab cycles within modal)
- Escape closes modals and returns focus to trigger element
- No keyboard traps (can navigate away from all elements)

### Screen Reader Test

**Objective**: Verify content announced correctly to screen readers.

**Steps** (use NVDA, JAWS, or VoiceOver):
1. Navigate through admin portal with screen reader active
2. **Expected**:
   - Page title announced on navigation
   - Form labels announced with inputs
   - Buttons have descriptive labels
   - Error messages announced when validation fails
   - Loading states announced ("Loading pages...")
   - Success messages announced ("Page saved successfully")

### Automated Accessibility Test

**Steps**:
1. Open browser DevTools
2. Run Lighthouse accessibility audit
3. **Expected**: Score ≥90 (WCAG 2.1 Level AA compliance)
4. Fix any reported violations

**Acceptance Criteria**: FR-024, SC-008

---

## Performance Testing

### Page Load Performance (SC-003)

**Objective**: Verify p95 page load time <3 seconds.

**Steps**:
1. Open browser DevTools → Performance tab
2. Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
3. Record page load time
4. Repeat 10 times, calculate p95 (95th percentile)
5. **Expected**: p95 page load time <3 seconds

**Tools**:
- Chrome DevTools Lighthouse
- WebPageTest.org
- Performance tab in DevTools

### Action Feedback Performance (SC-004)

**Objective**: Verify editorial actions provide feedback within 2 seconds.

**Steps**:
1. Create a page
2. Measure time from click "Save" to success message displayed
3. **Expected**: Feedback <2 seconds
4. Repeat for: update page, delete page, upload asset, create site

**Acceptance Criteria**: SC-003, SC-004

---

## Validation Checklist

Before considering the feature complete, verify:

- [ ] **User Story 1 (Create and Publish a Page)**: All 4 acceptance scenarios pass
- [ ] **User Story 2 (Upload and Manage Assets)**: All 3 acceptance scenarios pass (including file validation)
- [ ] **User Story 3 (Create and Edit Sites)**: All 3 acceptance scenarios pass
- [ ] **Concurrent Edit Detection**: Warning displayed when page modified by another user
- [ ] **Error Handling**: Data preserved on failure, "Try Again" button works
- [ ] **Keyboard Navigation**: All functionality accessible via keyboard only
- [ ] **Screen Reader**: Content announced correctly
- [ ] **Accessibility Audit**: Lighthouse score ≥90
- [ ] **Page Load Performance**: p95 <3 seconds
- [ ] **Action Feedback**: <2 seconds for save/upload operations
- [ ] **First-Time Task Completion**: 90% success rate (SC-002)
- [ ] **Task Completion Time**: Create and publish page in <3 minutes (SC-001)

---

## Common Issues and Troubleshooting

### Issue: API Connection Failures

**Symptoms**: 401 Unauthorized or network errors in console

**Solutions**:
- Verify backend API is running (`https://localhost:5001/health`)
- Check `VITE_API_BASE_URL` in `.env.local`
- Verify authentication token in `VITE_AUTH_TOKEN` or browser storage

### Issue: File Upload Failures

**Symptoms**: Upload starts but fails with error

**Solutions**:
- Check file size (<10MB)
- Verify file type is allowed (JPEG, PNG, GIF, PDF, HTML)
- Check backend API file upload endpoint is configured correctly
- Verify storage service is accessible

### Issue: Concurrent Edit Warning Not Appearing

**Symptoms**: No warning when page modified by another user

**Solutions**:
- Verify `VITE_ENABLE_CONCURRENT_EDIT_WARNING=true` in `.env.local`
- Check `lastModified` timestamp in API response
- Ensure backend returns updated `lastModified` on every save

### Issue: Accessibility Violations

**Symptoms**: Lighthouse accessibility score <90

**Solutions**:
- Run axe DevTools to identify specific violations
- Ensure all form inputs have associated labels
- Verify color contrast meets WCAG AA (4.5:1 for normal text)
- Add ARIA labels to icon-only buttons
- Ensure focus indicators are visible

---

## Next Steps

After validating all scenarios:

1. **Deploy to staging environment**
2. **Conduct user acceptance testing** with real content managers
3. **Measure actual performance** in production environment
4. **Gather feedback** on usability and task completion
5. **Iterate** based on feedback and metrics

---

## Notes

- **No Scheduled Publishing**: Pages use simple isPublished boolean (no date-based scheduling)
- **No Page-Asset Associations**: Assets are independent; content managers manage asset library separately
- **Draft by Default**: New pages default to `isPublished = false` unless explicitly published
- **Optimistic Updates**: UI updates immediately; rollback on API failure
- **Constitution Compliance**: All 5 principles (Reliability, Consistency, Performance, Responsiveness, Maintainability) validated
