# AgentCMS

A multi-tenant headless CMS platform for managing sites, pages, and assets — featuring a RESTful API backend and a modern React admin portal.

![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![React 18](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Express-CC2927?logo=microsoftsqlserver)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

AgentCMS is a headless content management system designed for multi-tenant content delivery. It provides complete site-scoped isolation, a page lifecycle (draft/published), and pluggable file storage for assets. The platform is split into independent projects that can be developed, tested, and deployed separately.

### Key Capabilities

- **Multi-Tenant Sites** — Create isolated sites, each containing its own pages and assets
- **Page Lifecycle** — Draft and published states with publish/unpublish workflow
- **Asset Management** — File upload (multipart), URL-based asset creation, and download streaming
- **Tenant Isolation** — All content operations are scoped to a site; cross-tenant access is prevented at every layer
- **Admin Portal** — Intuitive React UI with drag-and-drop uploads, optimistic updates, and WCAG 2.1 AA accessibility

---

## Repository Structure

```
AgentCMS/
├── agentcms.api/        # .NET 8 REST API (backend)
├── agentcms.web/        # React + TypeScript admin portal (frontend)
├── agentcms.models/     # Shared models (planned)
├── agentcms.client/     # API client library (planned)
└── README.md
```

| Project | Description | Tech Stack |
|---------|-------------|------------|
| **agentcms.api** | RESTful headless CMS API with EF Core and SQL Server | .NET 8, ASP.NET Core, EF Core 8, SQL Server Express, Swagger |
| **agentcms.web** | Admin portal for content managers | React 18, TypeScript, TanStack Query, Tailwind CSS, Vite |
| **agentcms.models** | Shared domain models *(placeholder)* | — |
| **agentcms.client** | Generated/typed API client *(placeholder)* | — |

---

## Getting Started

### Prerequisites

| Dependency | Version | Purpose |
|------------|---------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0+ | API backend |
| [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) | 2019+ | Database |
| [Node.js](https://nodejs.org/) | 18+ | Admin portal |
| npm | 9+ | Frontend package management |

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AgentCMS
```

### 2. Set Up the API

```bash
cd agentcms.api

# Restore dependencies
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the API
dotnet run
```

The API will be available at **http://localhost:5000** with Swagger UI at the root.

### 3. Set Up the Admin Portal

```bash
cd agentcms.web

# Install dependencies
npm install

# Configure the API endpoint
# Create a .env file with:
#   VITE_API_BASE_URL=http://localhost:5000

# Start the dev server
npm run dev
```

The admin portal will be available at **http://localhost:5173**.

---

## API Reference

The API follows RESTful conventions with site-scoped routes for tenant isolation. Full interactive docs are available via Swagger UI when the API is running.

### Sites

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/sites` | Create a new site |
| `GET` | `/v1/sites` | List all sites |
| `GET` | `/v1/sites/{id}` | Get a site by ID |
| `PUT` | `/v1/sites/{id}` | Update a site |
| `DELETE` | `/v1/sites/{id}` | Delete a site (guarded) |

### Pages *(site-scoped)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/sites/{siteId}/pages` | Create a page |
| `GET` | `/v1/sites/{siteId}/pages` | List pages for a site |
| `GET` | `/v1/sites/{siteId}/pages/{id}` | Get a page by ID |
| `PUT` | `/v1/sites/{siteId}/pages/{id}` | Update a page |
| `DELETE` | `/v1/sites/{siteId}/pages/{id}` | Delete a page |

### Assets *(site-scoped)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/sites/{siteId}/assets/upload` | Upload a file (multipart) |
| `POST` | `/v1/sites/{siteId}/assets/from-url` | Create asset from URL |
| `GET` | `/v1/sites/{siteId}/assets` | List assets for a site |
| `GET` | `/v1/sites/{siteId}/assets/{id}` | Get asset metadata |
| `GET` | `/v1/sites/{siteId}/assets/{id}/download` | Download asset file |
| `DELETE` | `/v1/sites/{siteId}/assets/{id}` | Delete an asset |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────────────────┐
│   agentcms.web      │  HTTP   │         agentcms.api             │
│   (React SPA)       │────────▶│       (ASP.NET Core)             │
│                     │         │                                  │
│  • TanStack Query   │         │  Controllers ─▶ Services ─▶ Repos│
│  • React Hook Form  │         │                     │            │
│  • Tailwind CSS     │         │               ┌─────┴─────┐     │
│  • Vite             │         │               │ EF Core    │     │
└─────────────────────┘         │               │ DbContext   │     │
                                │               └─────┬─────┘     │
                                │                     │            │
                                │              ┌──────▼──────┐    │
                                │              │ SQL Server   │    │
                                │              │ Express      │    │
                                │              └─────────────┘    │
                                │                                  │
                                │  IFileStore ──▶ LocalFileStore   │
                                │              (pluggable storage) │
                                └──────────────────────────────────┘
```

### Design Principles

- **Repository Pattern** — Data access is abstracted behind interfaces (`ISiteRepository`, `IPageRepository`, `IAssetRepository`)
- **Service Layer** — Business logic (validation, lifecycle management, deletion guards) lives in services
- **Pluggable Storage** — File storage is abstracted via `IFileStore`; currently backed by local filesystem, ready for cloud providers (Azure Blob, AWS S3)
- **Tenant Isolation** — Enforced at repository, service, and controller layers
- **Middleware Pipeline** — Request logging with correlation IDs (`X-Request-ID`) and global exception handling

### Database Schema

| Table | Key Columns |
|-------|-------------|
| **Sites** | `Id` (PK, GUID), `Name` (unique, 255), `Description` (255) |
| **Pages** | `Id` (PK, GUID), `SiteId` (FK), `Title`, `Body`, `CreatedDate`, `UpdatedDate`, `PublishedDate`, `CreatedBy`, `UpdatedBy` |
| **Assets** | `Id` (PK, GUID), `SiteId` (FK), `Filename`, `MimeType`, `Url`, `CreatedDate`, `CreatedBy` |

Foreign keys use `DELETE RESTRICT` — sites cannot be deleted while they contain pages or assets.

---

## Development

### API (agentcms.api)

```bash
cd agentcms.api
dotnet run          # Start with hot-reload
dotnet watch run    # Start with file watching
dotnet test         # Run tests
```

**Configuration** is in [agentcms.api/appsettings.json](agentcms.api/appsettings.json):
- `ConnectionStrings:DefaultConnection` — SQL Server connection string
- `FileStorage:LocalPath` — Local upload directory (default: `C:\AgentCMS\uploads`)
- `FileStorage:BaseUrl` — Public base URL for asset downloads

### Admin Portal (agentcms.web)

```bash
cd agentcms.web
npm run dev              # Start dev server
npm run build            # Production build
npm run test             # Unit & component tests (Vitest)
npm run test:e2e         # End-to-end tests (Playwright)
npm run test:a11y        # Accessibility tests
npm run test:coverage    # Test coverage report
npm run lint             # Lint with ESLint
npm run type-check       # TypeScript type checking
```

### Validation & Security

| Feature | Detail |
|---------|--------|
| MIME whitelist | `image/jpeg`, `image/png`, `application/pdf` |
| Max file size | 30 MB |
| Empty file rejection | 0-byte files are rejected |
| GUID filenames | Uploaded files are renamed to prevent path traversal |
| DTO validation | Data Annotations (`[Required]`, `[MaxLength]`) on all DTOs |
| CORS | Configured for localhost in development |

---

## Project Specs

Detailed specifications for each feature are maintained alongside their respective projects:

- **API specs**: [agentcms.api/specs/001-agentcms-crud-api/](agentcms.api/specs/001-agentcms-crud-api/)
- **Admin portal specs**: [agentcms.web/specs/001-admin-portal/](agentcms.web/specs/001-admin-portal/)

---

## License

This project is licensed under the MIT License.
