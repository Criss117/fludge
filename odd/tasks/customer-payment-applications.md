# customer-payment-applications

## Contexto
Al crear un `CustomerPayment`, el `PaySaleService` distribuye el monto entre las sales abiertas del cliente. Hoy no existe ningún registro de qué sales fueron pagadas con cada payment. Al cancelar un payment, necesitamos poder revertir esos cambios exactamente.

## Decisiones
- Tabla pivote `customer_payment_application` en el contexto `customer` (pertenece al agregado `CustomerPayment`)
- No se introduce infraestructura de eventos de dominio (overkill para el scope actual)
- Se corrige bug en `PaySaleService`: la distribución de pagos estaba calculando mal el monto a aplicar a cada sale

## Tareas
- [ ] Crear schema DB: `customer_payment_application`
- [ ] Crear entidad de dominio `CustomerPaymentApplication`
- [ ] Crear repositorio: interface + SQLite + InMemory
- [ ] Corregir bug en `PaySaleService` y devolver aplicaciones
- [ ] Modificar `CreateCustomerPaymentCommand` para persistir aplicaciones
- [ ] Actualizar containers (customer + sales)
- [ ] Agregar tests para entidad y comando

## Archivos a tocar
- `packages/db/src/schema/customer-payment-application.schema.ts` (nuevo)
- `packages/db/src/schema/index.ts`
- `packages/api/src/modules/customer/domain/entities/customer-payment-application.entity.ts` (nuevo)
- `packages/api/src/modules/customer/domain/repositories/customer-payment-application.repository.ts` (nuevo)
- `packages/api/src/modules/customer/infrastructure/repositories/sqlite-customer-payment-application.repository.ts` (nuevo)
- `packages/api/test/support/repositories/in-memory-customer-payment-application.repository.ts` (nuevo)
- `packages/api/src/modules/sales/application/services/pay-sale.service.ts`
- `packages/api/src/modules/customer/application/commands/create-customer-payment.command.ts`
- `packages/api/src/modules/customer/container.ts`
- `packages/api/src/modules/sales/container.ts`
- `packages/api/test/modules/customer/application/commands/create-customer-payment.command.test.ts`
- `packages/api/test/modules/customer/domain/entities/customer-payment-application-entity.test.ts` (nuevo)
