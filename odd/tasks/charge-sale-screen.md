# Feature: charge-sale-screen

Completa la pantalla de cobro en `apps/native`, basándose en la estructura y comportamiento de `apps/native-old`. Mantiene los componentes atómicos, fáciles de leer, con traducciones en `packages/i18n` e iconos de `@expo/material-symbols`.

## Specs

S1. "ahora quiero que completes la pantalla de cobro, basate en la de native-old, sigue la misma estructura, manten los componentes atomicos y faciles de leer, crea las traducciones necesarias y si necesitas agregar iconos hazlo, recuerda de que libreira son los iconos"
S2. La pantalla de cobro debe mostrar: selector de cliente ("walk-in" / "cliente"), tipo de pago ("efectivo" / "crédito" solo cuando aplica), monto recibido con vuelto, resumen expandible del ticket y botón de cobro fijo al pie.
S3. El botón "Cobrar" del `TicketDetailSheet` debe navegar a `/dashboard/pos/charge`.
S4. Al confirmar el cobro se crea la venta vía `useCreateSaleMutation`, se limpia el ticket activo y se vuelve atrás.
S5. Los componentes deben usar la librería de UI actual de `apps/native`: `@expo/ui/jetpack-compose`, `SectionCard`, `ThemedNativeText`, `TextInput`, `Icon`.
S6. Los iconos son de `@expo/material-symbols` y se consumen a través del componente `Icon` en `@/core/shared/components/icon`.
S7. Se agregan las traducciones necesarias en `packages/i18n/src/locales/es/screens.ts`, `helpers.ts` y `forms.ts`.
S8. El botón "Cobrar" del `TicketDetailSheet` debe estar deshabilitado cuando el ticket no tiene ítems.
S9. Al tocar "Cobrar" en el `TicketDetailSheet` se debe cerrar el sheet y luego navegar a `/dashboard/pos/charge`.
S10. Los componentes de `@expo/ui` deben estar envueltos en `Host`.
S11. Las secciones deben seguir la estructura `sections/charge/<nombre>/index.tsx` para permitir futura separación android/iOS (`index.tsx` / `index.ios.tsx`).
S12. Dentro de un árbol `@expo/ui` no se deben usar `View` de React Native; se reemplazan por `Column`/`Row`/`Box` con los modifiers correspondientes (`background`, `clip`, `paddingAll`, etc.).

## Tasks

- [x] T1: Actualizar traducciones i18n (S7)
- [x] T2: Agregar iconos faltantes a `icon.tsx` (S6)
- [x] T3: Crear sección `PaymentTypeSection` (S2, S5)
- [x] T4: Crear sección `AmountReceivedSection` (S2, S5)
- [x] T5: Crear sección `ChargeSummarySection` (S2, S5)
- [x] T6: Crear componentes `CustomerSaleCard` y `CustomerSelector` (S2, S5)
- [x] T7: Crear pantalla `ChargeSaleScreen` (S1, S2, S4)
- [x] T8: Agregar ruta `/dashboard/pos/charge` y navegación desde `TicketDetailSheet` (S3)
- [x] T9: Deshabilitar "Cobrar" si el ticket está vacío y cerrar sheet al navegar (S8, S9)
- [x] T10: Envolver componentes `@expo/ui` en `Host` (S10)
- [x] T11: Reestructurar secciones a `sections/charge/<nombre>/index.tsx` (S11)
- [x] T12: Reemplazar `View` de React Native por `Column`/`Row`/`Box` dentro de árboles `@expo/ui` (S12)
- [x] T13: Verificar tipos, lint y formato

## Verification evidence

- `bun run --cwd apps/native check-types` → pass
- `bun run --cwd packages/i18n check-types` → pass
- `bun run --cwd packages/client check-types` → pass
- `bun run --cwd apps/native lint` → pass
- `bun run --cwd packages/i18n lint` → pass
- `bun run --cwd packages/client lint` → pass (3 pre-existing warnings unrelated to this change)
- `prettier --check` on all touched files → pass
- No test infra for native UI components; verification is typecheck + lint + prettier

## Notes

- No commits were made; user can decide whether to commit.
- `@expo/ui` trees must not contain React Native `View`; use `Column`/`Row`/`Box` with modifiers (`background`, `clip`, `paddingAll`, `size`, etc.).

## Log

L1: "ahora quiero que completes la pantalla de cobro, basate en la de native-old, sigue la misma estructura, manten los componentes atomicos y faciles de leer, crea las traducciones necesarias y si necesitas agregar iconos hazlo, recuerda de que libreira son los iconos"
