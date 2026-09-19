# Feature: sales-list-screen

## Objective

Complete the sales list screen (dashboard sales tab): one card per sale with saleNumber/date/status, paymentType + total, customer id + items count, and a footer with "Tirilla" (receipt dialog), "Detalle" (no-op) and a more-vert popover (empty for now).

## Problem

`sale.screen.tsx` is a placeholder dumping JSON. The `useFindSales` infinite query and the local `SaleRepository` already exist; the UI is missing.

## Why

User request: "completa la pantalla de listado de ventas, quiero que muestres una card por venta ... un boton que diga tirilla que abrira un dialog ... basate en ChargeSaleSummarySection, un boton que diga detalle ... y un more vert que abrira un popover, por ahora sin contenido".

## Scope

New files:

- apps/native/src/modules/sales/presentation/components/sale-card.tsx (card + status chip + skeleton)
- apps/native/src/modules/sales/presentation/components/sale-receipt-dialog.tsx (receipt-style dialog)

Files to edit:

- apps/native/src/modules/sales/presentation/screens/sale.screen.tsx (FlatList + skeleton + empty/footer states)
- packages/i18n/src/locales/es/screens.ts (sales.history._, sales.status._, sales.card._, sales.receipt._)
- apps/native/src/app/(private)/dashboard/(tabs)/_layout.tsx (fix stale /(private)/sales link → /(private)/pos)
- apps/native/src/modules/sales/presentation/components/sale-summary/content.tsx (fix stale /sales/charge link → /pos/charge)

## Constraints

- Card pattern follows customer-card.tsx: fixed height + getItemLayout, compound Card.Header/Body/Footer, MaterialIcons, StatusChip-style chips.
- Receipt dialog bases on ChargeSaleSummarySection receipt style (RECEIPT_FONT_SIZE 13, dashed separators, muted meta).
- Tirilla = primary button; Detalle = outline, no onPress yet; more-vert = Popover (pattern from product-menu-options.tsx), empty content.
- findAll has no filters: list has no search input; screen calls useFindSales("").
- List perf rules: memoizable fixed-height cards, getItemLayout, hoisted components, no inline objects in renderItem.
- Keep the user's in-flight POS rename (pos/ routes, pos.screen.tsx) uncommitted; this commit only stages sales-list files + the two stale-route fixes.

## Checklist

- [ ] T1: Fix stale route links (tabs header, charge summary)
- [ ] T2: SaleCard + SaleStatusChip + skeleton
- [ ] T3: SaleReceiptDialog (receipt-style, based on ChargeSaleSummarySection)
- [ ] T4: Rewrite sale.screen.tsx list (FlatList, infinite scroll, skeleton/empty/footer)
- [ ] T5: i18n keys (es)
- [ ] T6: check-types + i18n tests + prettier

## Verification evidence

- (pending)

## Delivery

- Branch: feat/sales-list-screen
- Forecast authored lines: ~330 (within 400 budget)
- Strategy: ask-on-risk
