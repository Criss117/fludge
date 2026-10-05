import type { DatabaseService } from "@/integrations/db";
import type {
  CustomerRepository,
  FindAllCustomersFilters,
} from "@fludge/client/commerce/domain/customer.repository";
import {
  buildConflictUpdateColumn,
  jsonObject,
} from "@fludge/db/utils/build-queries";
import { and, desc, eq, getColumns, inArray, like, sql } from "drizzle-orm";
import {
  type Cursor,
  type PaginatedResponse,
  paginate,
} from "@fludge/utils/pagination";
import {
  localCustomer,
  localCustomerPayment,
  type LocalCustomer,
} from "@fludge/db/local-schemas/shared.schema";
import type {
  CustomerDetail,
  CustomerSummary,
} from "@fludge/client/commerce/domain/entities";

export class NativeCustomerRepository implements CustomerRepository {
  constructor(private readonly db: DatabaseService) {}
  public async clearAll(): Promise<void> {
    this.db.transaction((tx) => {
      tx.delete(localCustomerPayment).run();
      tx.delete(localCustomer).run();
    });
  }

  public async findAll(
    organizationId: string,
    cursor: Cursor,
    filters?: FindAllCustomersFilters
  ): Promise<PaginatedResponse<CustomerSummary>> {
    const rows = this.db
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
      .orderBy(desc(localCustomer.createdAt))
      .all();

    return paginate(rows, cursor);
  }

  public async findOneById(
    organizationId: string,
    customerId: string
  ): Promise<CustomerDetail | null> {
    const customer = this.db
      .select({
        ...getColumns(localCustomer),
        payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(localCustomerPayment)}
            ) FILTER (WHERE ${localCustomerPayment.customerId} IS NOT NULL)
          `.as("payments"),
      })
      .from(localCustomer)
      .leftJoin(
        localCustomerPayment,
        eq(localCustomerPayment.customerId, localCustomer.id)
      )
      .where(
        and(
          eq(localCustomer.organizationId, organizationId),
          eq(localCustomer.id, customerId)
        )
      )
      .limit(1)
      .get();

    if (!customer) return null;

    return {
      ...customer,
      payments: (
        JSON.parse(customer.payments) as CustomerDetail["payments"]
      ).map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })),
    };
  }

  public async save(
    customerValues: LocalCustomer | LocalCustomer[]
  ): Promise<void> {
    const customersArray = Array.isArray(customerValues)
      ? customerValues
      : [customerValues];

    const customers: Omit<LocalCustomer, "payments">[] = [];
    const payments: LocalCustomer["payments"] = [];

    for (const customer of customersArray) {
      const { payments: customerPayments, ...customerValues } = customer;

      customers.push(customerValues);
      payments.push(...customerPayments);
    }

    this.db.transaction((tx) => {
      tx.insert(localCustomer)
        .values(customers)
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
        })
        .run();

      if (payments.length > 0) {
        tx.delete(localCustomerPayment)
          .where(
            inArray(
              localCustomerPayment.customerId,
              customers.map((c) => c.id)
            )
          )
          .run();

        tx.insert(localCustomerPayment).values(payments).run();
      }
    });
  }

  public async delete(
    organizationId: string,
    customerId: string | string[]
  ): Promise<void> {
    const customerIds = Array.isArray(customerId) ? customerId : [customerId];

    this.db
      .delete(localCustomer)
      .where(
        and(
          eq(localCustomer.organizationId, organizationId),
          inArray(localCustomer.id, customerIds)
        )
      )
      .run();
  }
}
