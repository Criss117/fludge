# customer-payment-applications

## Contexto
Al crear un `CustomerPayment`, el `PaySaleService` distribuye el monto entre las sales abiertas del cliente. Hoy no existe ningún registro de qué sales fueron pagadas con cada payment. Al cancelar un payment, necesitamos poder revertir esos cambios exactamente.

## Decisiones
- Tabla pivote `customer_payment_application` en el contexto `customer` (pertenece al agregado `CustomerPayment`)
- No se introduce infraestructura de eventos de dominio (overkill para el scope actual)
- Se corrige bug en `PaySaleService`: la distribución de pagos estaba calculando mal el monto a aplicar a cada sale

## Tareas completadas
- [x] Crear schema DB: `customer_payment_application`
- [x] Crear entidad de dominio `CustomerPaymentApplication`
- [x] Crear repositorio: interface + SQLite + InMemory
- [x] Corregir bug en `PaySaleService` y devolver aplicaciones
- [x] Modificar `CreateCustomerPaymentCommand` para persistir aplicaciones
- [x] Actualizar containers (customer + sales)
- [x] Agregar tests para entidad y comando

## Tareas pendientes
- [x] Agregar `Sale.revertPayment(amount)` para deshacer pagos
- [x] Permitir transición `completed → open` en `SaleStatus`
- [x] Implementar `CancelCustomerPaymentCommand`
- [x] Agregar endpoint cancel al router
- [x] Agregar tests para cancel command y `Sale.revertPayment`

## Estado
Feature completa. Branch: `feat/cancel-customer-payment` (commit `b3bca85`).
Total tests: 35 pass (6 cancel command + 29 sale entity, incluyendo 4 revertPayment).

## Archivos a tocar (fase 2)
- `packages/api/src/modules/sales/domain/entities/sale.entity.ts`
- `packages/api/src/modules/sales/domain/value-objects/sale-status.ts`
- `packages/api/src/modules/customer/application/commands/cancel-customer-payment.command.ts` (nuevo, reemplaza `cancel-customer-paymente.command.ts`)
- `packages/api/src/modules/customer/infrastructure/http/customer-payment.router.ts`
- `packages/api/src/modules/customer/container.ts`
- `packages/api/test/modules/customer/application/commands/cancel-customer-payment.command.test.ts` (nuevo)
- `packages/api/test/modules/sales/domain/entities/sale-entity.test.ts`
