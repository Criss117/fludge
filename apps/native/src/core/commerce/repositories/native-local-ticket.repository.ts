import type {
  LocalTicketRepository,
  Ticket,
} from "@fludge/client/commerce/domain/local-ticket.repository";
import { localProduct } from "@fludge/db/local-schemas/shared.schema";
import type { TicketProductSelect, TicketSelect } from "@fludge/db/local-schemas/ticket.schema";
import { ticket, ticketProduct } from "@fludge/db/local-schemas/ticket.schema";
import { type RepositoryError, toRepositoryError } from "@fludge/utils/errors/repository.error";
import { type Result, tryCatch } from "@fludge/utils/trycatch";
import { and, eq, getColumns, inArray } from "drizzle-orm";

import type { DatabaseService } from "@/integrations/db";

export class NativeLocalTicketRepository implements LocalTicketRepository {
  constructor(private readonly db: DatabaseService) {}

  public async clearAll(): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.transaction((tx) => {
          tx.delete(ticketProduct).run();
          tx.delete(ticket).run();
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.sales.isr_on_delete", raw),
      },
    );
  }

  public async load(organizationId: string): Promise<Result<Ticket[], RepositoryError>> {
    return tryCatch(
      () => {
        const tickets = this.db
          .select()
          .from(ticket)
          .where(eq(ticket.organizationId, organizationId))
          .all();

        if (tickets.length === 0) {
          const [defaultTicket] = this.db
            .insert(ticket)
            .values({
              id: Date.now().toString() + Math.floor(Math.random() * 1000),
              organizationId,
              name: "Ticket-1",
            })
            .returning()
            .all();

          return [
            {
              ...defaultTicket,
              items: [],
            },
          ];
        }

        const itemRows = this.db
          .select({
            ...getColumns(ticketProduct),
            name: localProduct.name,
            stock: localProduct.stock,
            allowNegativeStock: localProduct.allowNegativeStock,
            minStock: localProduct.minStock,
          })
          .from(ticketProduct)
          .leftJoin(localProduct, eq(localProduct.id, ticketProduct.productId))
          .where(
            and(
              inArray(
                ticketProduct.ticketId,
                tickets.map((t) => t.id),
              ),
            ),
          )
          .all();

        const allTickets = tickets.map((ticketRow) => {
          const ticketProducts = itemRows.filter((product) => product.ticketId === ticketRow.id);

          return {
            ...ticketRow,
            items: ticketProducts.map((p) => ({
              ...p,
              name: p.name ?? "N/A",
              stock: p.stock ?? 0,
              allowNegativeStock: p.allowNegativeStock ?? true,
              minStock: p.minStock ?? 0,
            })),
          };
        });

        return allTickets;
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.sales.isr_on_find", raw),
      },
    );
  }

  public async save(
    organizationId: string,
    tickets: Ticket[],
  ): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        const flatTickets: TicketSelect[] = [];
        const flatProducts: TicketProductSelect[] = [];

        for (const ticketData of tickets) {
          const { items, ...ticketValues } = ticketData;

          flatTickets.push(ticketValues);
          flatProducts.push(...items);
        }

        const allTickets = this.db
          .select({
            id: ticket.id,
          })
          .from(ticket)
          .all();

        this.db.transaction((tx) => {
          tx.delete(ticketProduct)
            .where(
              inArray(
                ticketProduct.ticketId,
                allTickets.map((t) => t.id),
              ),
            )
            .run();

          tx.delete(ticket).where(eq(ticket.organizationId, organizationId)).run();

          tx.insert(ticket).values(flatTickets).run();

          if (flatProducts.length > 0) {
            tx.insert(ticketProduct).values(flatProducts).run();
          }
        });
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.sales.isr_on_save", raw),
      },
    );
  }

  public async clear(organizationId: string): Promise<Result<void, RepositoryError>> {
    return tryCatch(
      () => {
        this.db.delete(ticket).where(eq(ticket.organizationId, organizationId)).run();
      },
      {
        parseError: (raw) => toRepositoryError("api_errors.sales.isr_on_delete", raw),
      },
    );
  }
}
