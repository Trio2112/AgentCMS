# AgentCMS Admin Portal

A modern, accessible admin interface for managing websites, pages, and assets built with React, TypeScript, and TanStack Query.

## Features

- ✅ **Site Management**: Create, edit, and delete websites with table/grid view toggle
- ✅ **Page Management**: Full CRUD operations with publish toggle and concurrent edit detection
- ✅ **Asset Management**: Drag-and-drop file upload with progress tracking and preview
- ✅ **Accessibility**: WCAG 2.1 Level AA compliant with keyboard shortcuts
- ✅ **Performance**: <3s page load time with code splitting and optimistic updates
- ✅ **Type Safety**: Full TypeScript with strict mode
- ✅ **Testing**: Unit, component, E2E, and accessibility tests

## Tech Stack

- **Frontend**: React 18.2 + TypeScript 5.3
- **State Management**: TanStack Query 5.17 (server state), React Hook Form 7.49 (forms)
- **Validation**: Zod 3.22
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4
- **File Upload**: react-dropzone 14.2
- **Testing**: Vitest 1.2, React Testing Library 14.1, Playwright 1.41, axe-playwright

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Backend API running (see API documentation)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agentcms.web

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your API URL
VITE_API_BASE_URL=https://localhost:5001
```

### Development

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
```

### Testing

```bash
# Run unit and component tests
npm run test

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:performance

# Run all tests
npm run test:all
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
agentcms.web/
├── src/
│   ├── api/                 # API client configuration
│   ├── components/          # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── ...
│   ├── features/            # Feature-based modules
│   │   ├── sites/
│   │   │   ├── components/  # Site-specific components
│   │   │   ├── hooks/       # Site query/mutation hooks
│   │   │   ├── pages/       # Site pages
│   │   │   ├── types.ts     # Site type definitions
│   │   │   └── api.ts       # Site API calls
│   │   ├── pages/           # Page management feature
│   │   └── assets/          # Asset management feature
│   ├── hooks/               # Shared hooks
│   │   └── useKeyboardShortcuts.ts
│   ├── query/               # TanStack Query client
│   ├── schemas/             # Zod validation schemas
│   ├── types/               # Shared TypeScript types
│   ├── utils/               # Utility functions
│   │   └── errorMessages.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── tests/
│   ├── e2e/                 # End-to-end tests
│   ├── a11y/                # Accessibility tests
│   └── performance/         # Performance tests
├── docs/
│   └── deployment.md        # Deployment guide
├── specs/                   # Project specifications
│   └── 001-admin-portal/
│       ├── research.md      # Technical research
│       ├── data-model.md    # Data model
│       ├── plan.md          # Implementation plan
│       └── tasks.md         # Task breakdown
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Key Features

### Site Management

- Create, read, update, and delete sites
- Table and grid view modes
- Optimistic UI updates
- Form validation with Zod

### Page Management

- Full CRUD operations
- Publish/unpublish toggle
- Site filtering
- **Concurrent edit detection**: Warns when another user modifies the same page
- Character count for body content (65,535 max)

### Asset Management

- Drag-and-drop file upload
- Real-time upload progress tracking
- File type validation (images, videos, PDFs)
- File size limit (10MB)
- Thumbnail preview
- Site filtering
- Preview modal for images, videos, and PDFs
- Copy URL to clipboard

### Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard shortcuts:
  - `Ctrl+S`: Save forms
  - `Escape`: Close modals
- Focus management
- Screen reader support
- Proper ARIA labels

### Performance

- Code splitting (vendor chunks separated)
- Lazy loading of routes
- Optimistic UI updates
- Loading skeletons instead of spinners
- <3s page load time target
- Bundle size optimization

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://localhost:5001` |
| `VITE_API_TIMEOUT` | API timeout (ms) | `30000` |
| `VITE_AUTH_TOKEN_KEY` | LocalStorage key | `agentcms_auth_token` |
| `VITE_MAX_UPLOAD_SIZE` | Max file size (bytes) | `10485760` |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Ensure accessibility compliance
4. Run all tests before submitting
5. Update documentation as needed

## Testing Guidelines

### Unit Tests

Test individual hooks and utility functions:

```typescript
// src/features/sites/hooks/hooks.test.ts
describe('useSites', () => {
  it('should fetch sites successfully', async () => {
    // Test implementation
  });
});
```

### Component Tests

Test component rendering and interactions:

```typescript
// src/components/Button.test.tsx
describe('Button', () => {
  it('should render with correct variant', () => {
    // Test implementation
  });
});
```

### E2E Tests

Test complete user flows:

```typescript
// tests/e2e/sites.spec.ts
test('should create a new site', async ({ page }) => {
  // Test implementation
});
```

### Accessibility Tests

Test WCAG compliance:

```typescript
// tests/a11y/audit.spec.ts
test('Sites page should have no violations', async ({ page }) => {
  // Test implementation
});
```

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

Quick deploy to Vercel:

```bash
npm run build
vercel --prod
```

## Performance Targets

- **Page Load**: <3s (p95)
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **Total Blocking Time**: <300ms

## License

[Your License]

## Support

For issues or questions:
- Create an issue on GitHub
- Email: support@agentcms.com
