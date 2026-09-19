import { DatabaseService } from "@/integrations/db";
import type {
  CustomerRepository,
  CustomerSummary,
  FindAllCustomersFilters,
} from "@fludge/client/application/customer/domain/customer.repository";
import { buildConflictUpdateColumn } from "@fludge/db/utils/build-queries";
import { and, desc, eq, inArray, like } from "drizzle-orm";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";
import {
  localCustomer,
  type LocalCustomerSelect,
} from "@fludge/db/local-schemas/shared.schema";

export class NativeCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCustomersFilters
  ): Promise<PaginatedResponse<CustomerSummary>> {
    const rows = await this.db
      .select()
      .from(localCustomer)
      .where(
        and(
          eq(localCustomer.organizationId, organizationId),
          filters?.searchQuery
            ? like(localCustomer.name, `%${filters.searchQuery}%`)
            : undefined
        )
      )
      .limit(cursor.limit + 1)
      .offset(cursor.limit * cursor.page)
      .orderBy(desc(localCustomer.createdAt));

    return paginate(rows, cursor);
  }

  public async findOneById(
    organizationId: string,
    customerId: string
  ): Promise<CustomerSummary | null> {
    const rows = await this.db
      .select()
      .from(localCustomer)
      .where(
        and(
          eq(localCustomer.organizationId, organizationId),
          eq(localCustomer.id, customerId)
        )
      )
      .limit(1);

    return rows.at(0) || null;
  }

  public async save(
    customerValues: LocalCustomerSelect | LocalCustomerSelect[]
  ): Promise<void> {
    const customersArray = Array.isArray(customerValues)
      ? customerValues
      : [customerValues];

    await this.db
      .insert(localCustomer)
      .values(customersArray)
      .onConflictDoUpdate({
        target: localCustomer.id,
        set: buildConflictUpdateColumn(localCustomer, [
          "name",
          "phone",
          "email",
          "creditLimit",
          "balance",
          "documentType",
          "documentNumber",
          "status",
          "updatedAt",
        ]),
      });
  }

  public async delete(
    organizationId: string,
    customerId: string | string[]
  ): Promise<void> {
    const customerIds = Array.isArray(customerId) ? customerId : [customerId];

    await this.db
      .delete(localCustomer)
      .where(
        and(
          eq(localCustomer.organizationId, organizationId),
          inArray(localCustomer.id, customerIds)
        )
      );
  }
}