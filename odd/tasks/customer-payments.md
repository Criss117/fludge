# Customer Payments

Feature: Esquema de pagos de clientes (customer payments) — abono genérico a cuenta.

## Reglas de negocio
- Abono genérico a la cuenta del cliente (no vinculado a sale específica)
- Métodos: cash, transfer
- Pagos parciales permitidos
- Sin comprobante fiscal adicional
- Soft-delete con reversión de balance
- Aplicación automática al crear
- **El payment no puede exceder el balance del cliente**

## Tasks

1. [ ] Agregar enums `customerPaymentMethodEnum` y `customerPaymentStatusEnum` a `packages/utils/src/enums/db-enums.ts`
2. [ ] Crear schema `customer-payment.schema.ts` en `packages/db/src/schema/`
3. [ ] Exportar nuevo schema en `packages/db/src/schema/index.ts`
4. [ ] Crear validators Zod en `packages/utils/src/validators/customer-payment.validators.ts`
5. [ ] Crear value objects de dominio:
   - `customer-payment-amount.ts`
   - `customer-payment-method.ts`
   - `customer-payment-status.ts`
   - `customer-payment-cancellation.ts`
6. [ ] Crear entity `CustomerPayment`
7. [ ] Crear excepciones de dominio:
   - `customer-payment-not-found.exception.ts`
   - `invalid-payment-amount.exception.ts`
   - `payment-already-cancelled.exception.ts`
   - `payment-exceeds-balance.exception.ts`
   - `customer-has-no-debt.exception.ts`
8. [ ] Crear interfaz `CustomerPaymentRepository`
9. [ ] Crear application services:
   - `record-customer-payment.service.ts`
   - `cancel-customer-payment.service.ts`
10. [ ] Crear implementación infra `SQLiteCustomerPaymentRepository`
11. [ ] Actualizar container con nuevas dependencias
12. [ ] Crear router HTTP para customer payments
