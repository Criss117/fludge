import { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";
import { UUID } from "@fludge/utils/uuid";
import type { CustomerDocumentTypeEnum } from "@fludge/utils/enums/db-enums";

export type BuildCustomerOptions = {
  name?: string;
  phone?: string;
  email?: string | null;
  creditLimit?: number;
  balance?: number;
  documentType?: CustomerDocumentTypeEnum;
  documentNumber?: string;
  organizationId?: string;
  createdBy?: string;
};

export function buildCustomer(options?: BuildCustomerOptions) {
  const organizationId =
    options?.organizationId ?? "00000000-0000-4000-8000-000000000001";
  const createdBy =
    options?.createdBy ?? "00000000-0000-4000-8000-000000000002";

  return Customer.create({
    name: options?.name ?? "Juan Pérez",
    phone: options?.phone ?? "+57 300 123 4567",
    email: options?.email !== undefined ? options.email : "juan@example.com",
    creditLimit: options?.creditLimit ?? 500000,
    documentType: options?.documentType ?? "CC",
    documentNumber: options?.documentNumber ?? "1234567890",
    organizationId: UUID.fromString(organizationId),
    createdBy: UUID.fromString(createdBy),
  });
}

export function makeCustomerOrganizationId() {
  return UUID.fromString("00000000-0000-4000-8000-000000000001");
}

export function makeCustomerUserId() {
  return UUID.fromString("00000000-0000-4000-8000-000000000002");
}