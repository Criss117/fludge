# fludge

Sistema POS (Point of Sale) construido con TypeScript full-stack. Monorepo con app móvil en React Native y backend en Elysia.

## Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Backend**: Elysia + oRPC (APIs type-safe end-to-end)
- **Mobile**: React Native + Expo + HeroUI Native
- **Database**: SQLite (LibSQL) + Drizzle ORM
- **Auth**: Better Auth
- **Forms**: TanStack Form + Zod 4.x
- **State**: TanStack Query + oRPC client
- **Styles**: Tailwind CSS v4 + Uniwind

## Estructura del proyecto

```
fludge/
├── apps/
│   ├── native/          # App móvil (React Native + Expo)
│   └── server/          # Backend API (Elysia)
├── packages/
│   ├── api/             # Lógica de negocio, routers oRPC, comandos/queries
│   ├── auth/            # Configuración y lógica de autenticación (Better Auth)
│   ├── client/          # Lógica del cliente: schemas de formularios, hooks, mutaciones, providers
│   ├── config/          # Configuración compartida (TypeScript, ESLint)
│   ├── db/              # Schema de base de datos, migraciones, cliente Drizzle
│   ├── env/             # Variables de entorno validadas con @t3-oss/env
│   └── utils/           # Utilidades compartidas (permisos, helpers)
```

### Paquetes principales

| Paquete | Qué hace |
|---------|----------|
| `@fludge/api` | Routers oRPC organizados por módulo (iam, auth, seed). Cada módulo tiene commands (escritura) y queries (lectura). |
| `@fludge/client` | Capa del cliente: schemas de formularios (Zod), hooks de TanStack Form, mutaciones con cache strategy, providers de React. |
| `@fludge/db` | Schema declarativo con Drizzle (tablas: organization, member, group, user). Migraciones automáticas. |
| `@fludge/auth` | Configuración de Better Auth con soporte para Expo. |
| `@fludge/env` | Variables de entorno tipadas y validadas por entorno (server, native). |
| `@fludge/utils` | Utilidades puras: sistema de permisos, helpers de fecha, validaciones. |

### Convenciones de arquitectura

- **Separación API/Form**: Los schemas de formularios en `@fludge/client` duplican los campos de los commands de `@fludge/api` pero NUNCA los importan. Esto mantiene el desacoplamiento entre capas.
- **Commands vs Queries**: Los commands (escritura) retornan el objeto actualizado. Las queries (lectura) se cachean con TanStack Query.
- **Cache strategy**: Cada mutación define explícitamente qué queries invalidar o actualizar manualmente (`setQueryData` vs `invalidateQueries`).

## Scripts principales

### Desarrollo

| Script | Qué hace |
|--------|----------|
| `bun run dev` | Levanta todas las apps en modo desarrollo (server + native) |
| `bun run dev:server` | Solo el backend (Elysia en `localhost:3000`) |
| `bun run dev:native` | Solo la app móvil (Expo) |

### Base de datos

| Script | Qué hace |
|--------|----------|
| `bun run db:init` | Inicia Turso dev con `local.db` |
| `bun run db:reset` | Elimina la DB y la recrea desde cero |
| `bun run db:push` | Aplica el schema actual a la DB sin migraciones |
| `bun run db:generate` | Genera archivos de migración con Drizzle Kit |
| `bun run db:migrate` | Ejecuta migraciones pendientes |
| `bun run db:studio` | Abre Drizzle Studio (UI para explorar la DB) |
| `bun run db:start` | Levanta la DB con Docker Compose |
| `bun run db:stop` | Detiene los contenedores de DB |

### Calidad

| Script | Qué hace |
|--------|----------|
| `bun run check-types` | Verifica tipos TypeScript en todo el monorepo |
| `bun run test` | Ejecuta tests en todos los paquetes |
| `bun run build` | Build de producción de todas las apps |

### Otros

| Script | Qué hace |
|--------|----------|
| `bun run auth:generate` | Genera tipos y helpers de Better Auth |

## Getting started

```bash
# Instalar dependencias
bun install

# Iniciar la DB local (Turso)
bun run db:init

# Aplicar schema a la DB
bun run db:push

# Levantar todo (server + native)
bun run dev
```

La API corre en `http://localhost:3000`. La app móvil se levanta con Expo Go.

## Modelo de datos (IAM)

El sistema maneja organizaciones con miembros y grupos:

- **Organization**: Entidad principal. Tiene nombre, slug, datos fiscales.
- **Member**: Usuario vinculado a una organización con un rol específico.
- **Group**: Conjunto de permisos asignables a miembros.
- **User**: Cuenta de autenticación (Better Auth).

Cada tabla tiene auditoría automática (createdAt, updatedAt, createdBy).
