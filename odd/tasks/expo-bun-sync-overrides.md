# Sincronizar overrides de Expo para resolver bucle de `bunx expo install --check`

Feature: Resolver el bucle infinito de `bunx expo install --check` reportado por expo-doctor en `apps/native`.

## Contexto

- Monorepo Bun con workspaces (`apps/*`, `packages/*`) y `bunfig.toml` configurado con `linker = "hoisted"`.
- `package.json` raíz define `overrides` para paquetes Expo que quedaron desactualizados respecto a `apps/native/package.json`.
- Al ejecutar `bunx expo install --check` desde `apps/native`, la CLI detecta 8 paquetes desactualizados y entra en un ciclo de "actualizar → instalar → volver a detectar desactualizado".
- Paquetes reportados (actual → esperado):
  - `@expo/ui@57.0.19` → `~57.0.21`
  - `expo@57.0.24` → `~57.0.26`
  - `expo-build-properties@57.0.21` → `~57.0.22`
  - `expo-camera@57.0.5` → `~57.0.6`
  - `expo-constants@57.0.19` → `~57.0.20`
  - `expo-glass-effect@57.0.3` → `~57.0.4`
  - `expo-linking@57.0.10` → `~57.0.11`
  - `expo-router@57.0.22` → `~57.0.24`

## Tasks

1. [x] Sincronizar `overrides` de Expo en `package.json` raíz con las versiones esperadas por `expo install --check`.
2. [x] Actualizar las versiones explícitas de esos mismos paquetes en `apps/native/package.json`.
3. [x] Regenerar el lockfile y reinstalar dependencias (`bun install`; el paso `rm -rf bun.lock node_modules` quedó bloqueado por la guardia de seguridad del harness, pero no fue necesario — `bun install` re-resolvió y reescribió `bun.lock` desde los rangos actualizados).
4. [x] Verificar que `bunx expo install --check` ya no reporte dependencias desactualizadas ni entre en bucle.

## Verificación final

Comando: `cd apps/native && bunx expo install --check`

```
env: load .env
env: export EXPO_ATLAS EXPO_PUBLIC_SERVER_URL WITH_ROZENITE
Dependencies are up to date
```

Exit code: 0. Sin dependencias desactualizadas y sin bucle.

## Decisiones

- Mantener los `overrides` en la raíz porque fueron introducidos para estabilizar la resolución de dependencias Expo en el monorepo (`768676f`), pero actualizarlos a las versiones compatibles con el SDK 57 usado por la app.
- No modificar `react-native`, `expo-dev-client`, ni otros paquetes Expo que no aparecen en el reporte de `expo install --check`.
- Usar los rangos exactos recomendados por Expo (`~57.0.x`) tanto en `apps/native` como en los `overrides` raíz para evitar futuros desajustes.
