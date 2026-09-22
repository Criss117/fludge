import { TransactionalRepository } from "@fludge/api/modules/shared/infrastructure/repositories/transactional-repository";
import type { DatabaseService, TransactionService } from "@fludge/db";
import {
  customer,
  customerPayment,
  type CustomerPaymentSelect,
} from "@fludge/db/schema/customer.schema";
import { err, ok, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, sql } from "drizzle-orm";
import { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";

import { jsonObject } from "@fludge/db/utils/build-queries";

type Options = {
  tx?: TransactionService;
};

export class SQLiteCustomerRepository
  extends TransactionalRepository
  implements CustomerRepository
{
  constructor(private readonly db: DatabaseService) {
    super(db);
  }

  public async findById(organizationId: string, customerId: string) {
    const [rows, error] = await tryCatch(
      this.db
        .select({
          ...getColumns(customer),
          payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(customerPayment)}
            ) FILTER (WHERE ${customerPayment.customerId} IS NOT NULL)
          `,
        })
        .from(customer)
        .leftJoin(customerPayment, eq(customerPayment.customerId, customer.id))
        .where(
          and(
            eq(customer.id, customerId),
            eq(customer.organizationId, organizationId),
          ),
        )
        .limit(1),
    );

    if (error) return err(error);

    const data = rows.at(0);

    if (!data) return ok(null);

    return ok(
      Customer.reconstitute({
        ...data,
        payments: (JSON.parse(data.payments) as CustomerPaymentSelect[]).map(
          (p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            cancelledAt: p.cancelledAt ? new Date(p.cancelledAt) : null,
          }),
        ),
      }),
    );
  }

  public async findByDocument(organizationId: string, documentNumber: string) {
    const [rows, error] = await tryCatch(
      this.db
        .select({
          ...getColumns(customer),
          payments: sql<string>`
            json_group_array(
              DISTINCT ${jsonObject(customerPayment)}
            ) FILTER (WHERE ${customerPayment.customerId} IS NOT NULL)
          `,
        })
        .from(customer)
        .where(
          and(
            eq(customer.organizationId, organizationId),
            eq(customer.documentNumber, documentNumber),
          ),
        )
        .limit(1),
    );

    if (error) return err(error);

    const data = rows.at(0);

    if (!data) return ok(null);

    return ok(
      Customer.reconstitute({
        ...data,
        payments: (JSON.parse(data.payments) as CustomerPaymentSelect[]).map(
          (p) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            cancelledAt: p.cancelledAt ? new Date(p.cancelledAt) : null,
          }),
        ),
      }),
    );
  }

  private async saveContent(customerEntity: Customer, options: Options) {
    const values = customerEntity.values;

    const [, errInsert] = await tryCatch(
      (options.tx ?? this.db)
        .insert(customer)
        .values({
          id: values.id,
          name: values.name,
          phone: values.phone,
          email: values.email,
          creditLimit: values.creditLimit,
          balance: values.balance,
          documentType: values.documentType,
          documentNumber: values.documentNumber,
          organizationId: values.organizationId,
          createdBy: values.createdBy,
          status: values.status,
          createdAt: values.createdAt,
          updatedAt: values.updatedAt,
        })
        .onConflictDoUpdate({
          target: customer.id,
          set: {
            name: values.name,
            phone: values.phone,
            email: values.email,
            creditLimit: values.creditLimit,
            documentType: values.documentType,
            documentNumber: values.documentNumber,
            status: values.status,
            updatedAt: values.updatedAt,
          },
        }),
    );

    if (errInsert) throw errInsert;
  }

  public async save(customerEntity: Customer, options?: Options) {
    if (options?.tx) {
      return tryCatch(this.saveContent(customerEntity, options));
    }

    const transaction = this.db.transaction(async (tx) => {
      await this.saveContent(customerEntity, { tx });
    });

    return tryCatch(transaction);
  }
}
