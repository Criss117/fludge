---
# ── Identidad básica ─────────────────────────────────────────

title: "Fludge"
slug: "fludge"
summary: "Sistema POS full-stack en TypeScript con app móvil React Native y backend Elysia, diseñado para gestión de ventas, catálogo e inventario en organizaciones."
date: "2026-09-26"
status: "in-progress"
featured: false

# ── Links y stack ────────────────────────────────────────────

repoUrl: "https://github.com/Criss117/fludge"
demoUrl: ""
stack:
  - "TypeScript"
  - "Bun"
  - "Turborepo"
  - "Elysia"
  - "oRPC"
  - "React Native"
  - "Expo"
  - "HeroUI Native"
  - "SQLite (LibSQL)"
  - "Drizzle ORM"
  - "Better Auth"
  - "TanStack Query"
  - "TanStack Form"
  - "Zod 4"
  - "Tailwind CSS v4"

# ── Imágenes ─────────────────────────────────────────────────

images:
  hero:
    ext: "png"
    alt: "TODO: captura de pantalla principal de la app Fludge"
  description:
    ext: "png"
    alt: "TODO: diagrama de arquitectura del sistema o screenshot clave"
  gallery:
    - name: "1"
      ext: "png"
      alt: "TODO: screenshot del módulo de ventas"
      caption: ""
    - name: "2"
      ext: "png"
      alt: "TODO: screenshot del catálogo de productos"
      caption: ""
---

## Contexto y problema

Fludge es un sistema POS (Point of Sale) diseñado para pequeñas y medianas organizaciones que necesitan gestionar ventas, catálogo de productos e inventario desde un dispositivo móvil. La necesidad surgió de la falta de soluciones accesibles que combinen una experiencia móvil nativa con un backend type-safe sin fricción entre capas.

El sistema resuelve tres problemas centrales: el registro y seguimiento de ventas con múltiples tipos de pago (contado, crédito, parcial), la gestión de catálogo con estados de productos (activo, inactivo, descontinuado) y filtrado avanzado, y la administración de organizaciones con miembros y permisos granulares.

La arquitectura monorepo permite compartir lógica de negocio, schemas de validación y tipos entre el backend y la app móvil sin duplicación, manteniendo el desacoplamiento entre capas mediante la convención de separación API/Form.

## Decisiones de diseño

:::decision{title="Separación estricta entre schemas de API y formularios"}
Los schemas de formularios en `@fludge/client` duplican los campos de los commands de `@fludge/api` pero nunca los importan directamente. Esto mantiene el desacoplamiento entre capas: el cliente puede evolucionar sus validaciones (mensajes de error, transformaciones de UI) sin acoplarse a la estructura interna del backend. El trade-off es duplicación controlada de definiciones de campos, pero el beneficio es independencia total de evolución.
:::

:::decision{title="Commands vs Queries como separación de responsabilidades"}
Cada módulo de la API separa explícitamente commands (escritura) de queries (lectura). Los commands retornan el objeto actualizado para mantener la UI sincronizada sin un round-trip adicional. Las queries se cachean con TanStack Query, y cada mutación define explícitamente qué queries invalidar o actualizar manualmente (`setQueryData` vs `invalidateQueries`). Esto evita bugs de caché y hace el flujo de datos predecible.
:::

:::decision{title="Domain Exceptions como primeras ciudadanas"}
Las excepciones del dominio (`DomainException`) extienden `ORPCError` directamente, mapeando errores de negocio a códigos HTTP semánticos (`NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`) con keys de i18n. Esto significa que el backend nunca lanza strings crudos: cada error ya viene traducido y tipado para el cliente, eliminando capas de mapeo de errores.
:::

## Stack y justificación técnica

:::compare

| Opción         | Pro                                                                                     | Contra                                              |
| -------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Elysia + oRPC  | Type-safe end-to-end, integración nativa con Bun, generación automática de contrato API | Ecosistema más pequeño que Express/Fastify          |
| REST + Express | Maduro, gran ecosistema                                                                 | Sin type-safety automático, más boilerplate         |
| tRPC           | Type-safe similar a oRPC                                                                | Acoplado a TypeScript, menos flexible en transporte |
| :::            |

La elección de **Elysia + oRPC** se fundamenta en el type-safety end-to-end: los routers del backend generan automáticamente el contrato que el cliente consume, sin codegen manual ni duplicación de tipos. Junto con **Bun** como runtime, el stack completo es TypeScript puro de extremo a extremo.

**SQLite (LibSQL) con Drizzle ORM** se eligió por la simplicidad operativa: la base de datos vive como un archivo local durante desarrollo (`local.db`), se puede versionar con Turso para producción, y Drizzle genera SQL tipado sin el overhead de un ORM pesado como Prisma. El trade-off es menos features avanzadas de DB (triggers complejos, stored procedures), pero para un POS eso no es una limitación real.

**HeroUI Native + Tailwind CSS v4 + Uniwind** permite escribir estilos con la misma sintaxis de Tailwind que se usaría en web, pero compilando a estilos nativos de React Native. Esto unifica el lenguaje de diseño entre plataformas sin sacrificar performance nativa.

## Arquitectura / infraestructura

El sistema sigue una arquitectura modular basada en Clean/Hexagonal por módulo de negocio:

- **`packages/api`**: Lógica de negocio pura organizada por módulos (`iam`, `catalog`, `commerce`, `auth`, `sync`). Cada módulo tiene su propio container de dependencias, domain entities, commands y queries.
- **`packages/db`**: Schema declarativo con Drizzle, migraciones automáticas, cliente tipado.
- **`packages/auth`**: Configuración de Better Auth con soporte para Expo (secure store, deep linking).
- **`packages/client`**: Capa del cliente con schemas de formularios (Zod), hooks de TanStack Form, mutaciones con cache strategy y providers de React.
- **`apps/server`**: Backend HTTP con Elysia, monta los routers oRPC y expone la API en `localhost:3000`.
- **`apps/native`**: App móvil con Expo Router, módulos que espejan la estructura del backend (`catalog`, `commerce`, `iam`, `auth`).

:::diagram{caption="Los módulos del backend se reflejan en la app móvil, compartiendo tipos a través de paquetes del monorepo"}
![Diagrama de arquitectura o screenshot de la estructura del proyecto](images/description.png)
:::

La comunicación entre capas sigue el flujo: **UI (React Native)** → **TanStack Query + oRPC client** → **Elysia server** → **Domain logic (packages/api)** → **Drizzle ORM** → **SQLite**. Cada mutación del cliente define explícitamente las queries a invalidar, manteniendo la caché consistente sin polling.

## Desafíos y aprendizajes

El principal desafío técnico fue mantener el type-safety end-to-end sin sacrificar la separación de capas. La convención de "duplicar schemas sin importar" entre `@fludge/client` y `@fludge/api` parece counter-intuitive, pero permite que cada capa evolucione independiente: el cliente puede agregar validaciones de UI (formato de teléfono, máscaras) sin que el backend se entere, y el backend puede cambiar la estructura interna de commands sin romper formularios.

Otro desafío fue el manejo de estados de venta con transiciones complejas: una venta puede estar `open` → `partial` → `completed`, o `open` → `cancelled`, con pagos que se pueden revertir. El dominio de `Sale` encapsula estas transiciones con validación de estado, evitando que la UI o la API metan el código en estados inválidos.

## Resultado

El proyecto está en desarrollo activo. Los módulos core de la API (`iam`, `catalog`, `commerce`) están implementados con tests. La app móvil tiene las pantallas principales funcionando con autenticación, catálogo de productos con filtros, y flujo de ventas. La base de datos corre localmente con Turso para desarrollo y está preparada para despliegue con SQLite embebido o Turso cloud.

Próximos pasos: completar el módulo de reportes, agregar soporte offline con sincronización (`packages/sync`), y preparar el primer build de producción con EAS.
