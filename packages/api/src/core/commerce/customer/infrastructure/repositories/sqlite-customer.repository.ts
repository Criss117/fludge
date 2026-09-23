import { Customer } from "@core/commerce/customer/domain/entities/customer.entity";
import type {
  Options,
  CustomerRepository,
} from "@core/commerce/customer/domain/repositories/customer.repository";
import { TransactionalRepository } from "@core/shared/repositories/transactional-repository";
import type { DatabaseService } from "@fludge/db";
import {
  customer,
  customerPayment,
  type CustomerPaymentSelect,
} from "@fludge/db/schema/customer.schema";
import { jsonObject } from "@fludge/db/utils/build-queries";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, sql } from "drizzle-orm";

export class SQLiteCustomerRepository
  extends TransactionalRepository
  implements CustomerRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  private async find(
    organizationId: string,
    filter: { id?: string; documentNumber?: string },
  ) {
    const [rows, errFind] = await tryCatch(
      this.db
        .select({
          ...getColumns(customer),
          payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(customerPayment)}
            ) FILTER (WHERE ${customerPayment.customerId} IS NOT NULL)
          `.as("payments"),
        })
        .from(customer)
        .leftJoin(customerPayment, eq(customerPayment.customerId, customer.id))
        .where(
          and(
            eq(customer.organizationId, organizationId),
            filter.id ? eq(customer.id, filter.id) : undefined,
            filter.documentNumber
              ? eq(customer.documentNumber, filter.documentNumber)
              : undefined,
          ),
        )
        .limit(1)
        .groupBy(customer.id),
    );

    if (errFind) return err(errFind);

    const data = rows.at(0);

    if (!data) return ok(null);

    const payments = (
      JSON.parse(data.payments) as CustomerPaymentSelect[]
    ).map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));

    return ok(Customer.reconstitute({ ...data, payments }));
  }

  public async findById(organizationId: string, customerId: string) {
    return this.find(organizationId, { id: customerId });
  }

  public async findByDocument(
    organizationId: string,
    documentNumber: string,
  ) {
    return this.find(organizationId, { documentNumber });
  }

  public async insert(customerEntity: Customer, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = customerEntity.values;

    const [, errInsert] = await tryCatch(
      db.insert(customer).values(values).onConflictDoNothing(),
    );

    if (errInsert) return err(errInsert);

    return ok(undefined);
  }

  public async update(customerEntity: Customer, options?: Options) {
    const db = options?.tx ?? this.db;

    const values = customerEntity.values;

    const [, errUpdate] = await tryCatch(
      db
        .update(customer)
        .set({
          name: values.name,
          phone: values.phone,
          email: values.email,
          creditLimit: values.creditLimit,
          balance: values.balance,
          documentType: values.documentType,
          documentNumber: values.documentNumber,
          status: values.status,
          updatedAt: values.updatedAt,
        })
        .where(
          and(
            eq(customer.id, values.id),
            eq(customer.organizationId, values.organizationId),
          ),
        ),
    );

    if (errUpdate) return err(errUpdate);

    return ok(undefined);
  }
}
