# Seed Users Module — ODD Tasks

## Objective
Build a seed-users module that creates fake users via better-auth for testing. Users are created through `authService.api.signUpEmail` (same as real flow). The module provides a Zod schema for input validation and a method to clear auth-related tables.

## Problem
Need fake data for development/testing. Old seed depended on other modules (organizations, etc). New seed module is independent — only users use better-auth, rest will use direct DB inserts.

## Scope
- Zod schema: `{ rootUsers: number, memberUsers: number }`
- SeedUsersService: creates users via better-auth, returns `{ roots: User[], members: User[] }`
- clearAuthTables() method: deletes from `verification`, `account`, `session`, `user` (order matters for FK constraints)
- Router endpoint (devOnly)

## Constraints
- Members don't need org membership — just `isRoot: false`
- Use `@faker-js/faker` for fake data generation
- Follow existing project patterns (DI container, oRPC routers)

---

## Tasks

- [x] **T1**: Create Zod seed schema in `packages/utils/src/validators/seed.validators.ts` ✅
- [x] **T2**: Implement `SeedUsersService` with `seed()` and `clearAuthTables()` methods ✅
- [x] **T3**: Create seed router with devOnly endpoint ✅
- [x] **T4**: Wire seed router into app router ✅

## Acceptance Criteria
- [x] Schema validates `rootUsers` and `memberUsers` as non-negative integers ✅
- [x] `seed()` creates N root users and M members via better-auth ✅
- [x] `clearAuthTables()` deletes all auth tables in correct FK order ✅
- [x] Router exposes POST /seed/users and DELETE /seed/auth-tables endpoints ✅

## Verification
- `bun run check-types` passes (no seed errors) ✅
- Manual test: call endpoint with `{ rootUsers: 2, memberUsers: 5 }`

## Files Created/Modified
- `packages/utils/src/validators/seed.validators.ts` — Zod schema
- `packages/api/src/core/seed/services/seed-users.service.ts` — Service with seed() and clearAuthTables()
- `packages/api/src/core/seed/container.ts` — DI container
- `packages/api/src/core/seed/http/seed.router.ts` — oRPC router
- `packages/api/src/routers/index.ts` — Added seed router to appRouter

## Commit
`feat(seed): implement seed-users module with better-auth integration`