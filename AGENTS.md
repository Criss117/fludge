# AGENTS.md - Development Guide for Fludge

This file provides guidelines and commands for agentic coding agents working in the Fludge monorepo.

## Project Overview

Fludge is a TypeScript monorepo containing a Point of Sale (POS) system with:
- **Web App**: React + TanStack Router + TailwindCSS (port 3001)
- **Native App**: React Native + Expo + Uniwind
- **Server**: Express + oRPC + Drizzle ORM (port 3000)
- **Database**: SQLite with Turso support
- **Auth**: Better-Auth
- **Build System**: Turborepo

## Development Commands

### General Commands
```bash
# Install dependencies
bun install

# Start all apps in development mode
bun run dev

# Build all applications
bun run build

# Type checking across all apps
bun run check-types

# Start individual apps
bun run dev:web      # Web app only
bun run dev:server   # Server only
bun run dev:native   # Native/Expo only
```

### Database Commands
```bash
# Push schema changes to database
bun run db:push

# Open database studio UI
bun run db:studio

# Generate database types/migrations
bun run db:generate

# Run database migrations
bun run db:migrate

# Start local SQLite database
bun run db:local
```

### App-Specific Commands

#### Web App (apps/web)
```bash
cd apps/web
bun run dev          # Development server
bun run build        # Production build
bun run check-types  # Type checking only
bun run serve        # Preview production build
bun run generate-pwa-assets  # Generate PWA assets
```

#### Server (apps/server)
```bash
cd apps/server
bun run dev          # Development with tsx watch
bun run build        # Build with tsdown
bun run check-types  # Type checking
bun run compile      # Compile to standalone binary
bun run start        # Start production build
```

#### Native App (apps/native)
```bash
cd apps/native
bun run start        # Start Expo development server
bun run android      # Run on Android
bun run ios          # Run on iOS
bun run web          # Run as web app
bun run prebuild     # Generate native code
```

### Single Test Commands
This project uses type checking as the primary test method. For running specific type checks:
```bash
# Check types for specific app/package
turbo -F web check-types
turbo -F server check-types
turbo -F @fludge/api check-types

# Run with TypeScript compiler directly
cd apps/web && bun run check-types
cd apps/server && tsc -b
```

## Code Style Guidelines

### Import/Export Patterns
1. **Import Order**: External dependencies → Third-party libraries → Internal imports
2. **Named exports preferred** over default exports
3. **Barrel exports** in index files: `export * from "./module"`
4. **Type exports separated**: `export type { SomeType }`

```typescript
// ✅ Correct import order
import { createContext } from "@fludge/api/context";
import { appRouter } from "@fludge/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/node";
import cors from "cors";
import { logger } from "./logger";
```

### Naming Conventions
- **camelCase**: Functions, variables, methods
- **PascalCase**: Components, classes, types
- **kebab-case**: File names
- **UPPER_SNAKE_CASE**: Constants and enums

```typescript
// ✅ Correct patterns
const requireAuth = o.middleware(async ({ context, next }) => {
  // implementation
});

function RootComponent() {
  // component logic
}

export const StockMovement = {
  list: ["SALE", "PURCHASE", "ADJUSTMENT", "RETURN"],
} as const;
```

### TypeScript Configuration
- **Strict mode enabled** with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **ESNext target** with bundler module resolution
- **Verbatim module syntax** for precise imports/exports

### Error Handling
- **Custom exception classes** extending `ORPCError`
- **Middleware-based authentication** with consistent error responses
- **Type-safe error codes** and messages

```typescript
export class OrganizationNotFoundException extends ORPCError<"CONFLICT", undefined> {
  constructor(message = "Organization not found") {
    super("CONFLICT", { message });
  }
}
```

### Database Patterns
- **Audit metadata** on all tables: `createdAt`, `updatedAt`, `deletedAt`, `isActive`
- **Timestamps in milliseconds** using integer columns
- **Referential integrity** with cascade deletes
- **Schema validation** using Zod

```typescript
export const auditMetadata = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => new Date())
    .notNull(),
  // ...
};
```

### API Route Patterns
- **oRPC procedures** with input validation using Zod
- **Protected vs Public procedures** using middleware
- **Router composition** for modular API structure

```typescript
export const organizationsProcedures = {
  sayHi: publicProcedure
    .input(z.object({ name: z.string() }))
    .handler(({ input }) => `Hi ${input.name}`),
};

export const protectedProcedure = publicProcedure.use(requireAuth);
```

### Component Structure
- **File-based routing** with TanStack Router
- **Component variants** using `class-variance-authority`
- **Provider composition** for context management

```typescript
export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <ThemeProvider>
      <TanstackQueryProvider>{children}</TanstackQueryProvider>
    </ThemeProvider>
  );
}
```

### UI Components
- **shadcn/ui** component library
- **TailwindCSS utility classes** for styling
- **Responsive design** with mobile-first approach
- **Consistent spacing and typography**

### Monorepo Structure
- **Workspace dependencies** using `workspace:*` notation
- **Catalog dependencies** for shared versions
- **Package organization**: apps (executable), packages (libraries)
- **Type safety** across package boundaries

## Architecture Notes

### Type Safety
- **End-to-end type safety** using oRPC between client and server
- **Shared types** in `@fludge/api` package
- **Context typing** for authentication and request handling
- **Database schema inference** using Drizzle ORM

### Offline Support
- **TanStack Query persistence** with AsyncStorage for native app
- **Mutation queuing** for offline operations
- **Conflict resolution** strategies for sync

### Authentication
- **Better-Auth** integration across web and native
- **Session management** with secure cookies
- **Role-based access control** using permissions system

## Development Workflow

1. **Always run type checking** before committing: `bun run check-types`
2. **Use workspace dependencies** for internal packages
3. **Follow import ordering** conventions
4. **Add audit metadata** to new database tables
5. **Create custom exceptions** for domain-specific errors
6. **Use protected procedures** for authenticated endpoints
7. **Test offline scenarios** for native app features

## Package Manager
- **Bun** as primary package manager (v1.3.0)
- Use `bun install` for dependencies
- Use `bun run` for scripts