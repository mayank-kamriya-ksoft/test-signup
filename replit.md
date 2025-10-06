# Project Overview

This is a full-stack web application built with React, Express, and PostgreSQL. The application features a user registration system with email verification through the CleanSignups API. It uses a modern tech stack with Vite for frontend bundling, Drizzle ORM for database management, and shadcn/ui components for the user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for client-side routing (lightweight React Router alternative)
- **TanStack Query (React Query)** for server state management, data fetching, and caching

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with CSS variables for theming
- **class-variance-authority (CVA)** for managing component variants
- Design system uses "New York" style with neutral base color and CSS variables for easy theming

**Form Management**
- **React Hook Form** for performant form state management
- **Zod** for schema validation via @hookform/resolvers
- Shared validation schemas between client and server using Drizzle-Zod

**Project Structure**
- `client/src/pages/` - Route-level page components
- `client/src/components/ui/` - Reusable UI components from shadcn/ui
- `client/src/lib/` - Utility functions and React Query configuration
- `client/src/hooks/` - Custom React hooks
- Path aliases configured via TypeScript and Vite (`@/`, `@shared/`, `@assets/`)

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for API routes
- **ESM modules** throughout the codebase (type: "module" in package.json)
- Custom middleware for request logging and JSON parsing with raw body access

**Development & Production**
- Development mode uses Vite's middleware mode for SSR-like integration
- Production serves static files from `dist/public`
- Build process bundles server code with esbuild

**API Design**
- RESTful API endpoints under `/api` prefix
- Centralized error handling with appropriate HTTP status codes
- Email verification endpoint validates emails before registration

### Data Storage

**Database**
- **PostgreSQL** as the primary database
- **Neon Database** (@neondatabase/serverless) for serverless PostgreSQL connections
- **Drizzle ORM** for type-safe database queries and schema management

**Schema Design**
- Users table with fields: id (UUID), name, email (unique), password (hashed), verified (boolean), createdAt
- Passwords hashed using **bcrypt** with salt rounds of 12
- Email uniqueness enforced at database level

**Migration Management**
- Drizzle Kit for schema migrations
- Migrations stored in `./migrations` directory
- Schema defined in `shared/schema.ts` for sharing between client and server

**In-Memory Fallback**
- `MemStorage` class provides in-memory storage implementation
- Useful for development and testing without database dependency
- Implements same interface as database storage layer

### Authentication & Security

**Password Security**
- Bcrypt hashing with 12 salt rounds
- Passwords never stored in plain text
- Password validation requires minimum 8 characters

**Email Validation**
- Client-side validation with real-time feedback
- Server-side validation using Zod schemas
- Email uniqueness checked before account creation

**User Verification**
- Boolean `verified` flag in user model
- Prepared for email verification flow implementation

### External Dependencies

**CleanSignups Email Verification API**
- Third-party service for detecting disposable/temporary email addresses
- API endpoint: `https://api.cleansignups.com/verify`
- Bearer token authentication
- Returns: `isTemporary`, `isValid`, `qualityScore`, and `risks` array
- Graceful degradation: if API fails, registration is allowed but error is logged

**UI Component Libraries**
- Radix UI primitives for accessible, unstyled components
- Extensive component coverage (dialogs, dropdowns, forms, tooltips, etc.)
- All components wrapped with custom styling via Tailwind

**Development Tools**
- Replit-specific plugins for development experience (@replit/vite-plugin-*)
- PostCSS with Tailwind and Autoprefixer
- TypeScript strict mode enabled

**Key Dependencies**
- `axios` for HTTP requests to external APIs
- `date-fns` for date manipulation
- `nanoid` for generating unique identifiers
- `zod` for runtime schema validation
- `cmdk` for command palette functionality