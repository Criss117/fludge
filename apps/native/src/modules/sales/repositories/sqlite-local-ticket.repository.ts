import type { DatabaseService } from "@/integrations/db";
import type {
  LocalTicketRepository,
  Ticket,
  TicketProduct,
} from "@fludge/client/application/sales/domain/local-ticket.repository";
import type {
  TicketProductPresentationSelect,
  TicketProductSelect,
  TicketSelect,
} from "@fludge/db/local-schemas/ticket.schema";
import {
  ticket,
  ticketProduct,
  ticketProductPresentation,
} from "@fludge/db/local-schemas/ticket.schema";
import { localProduct } from "@fludge/db/local-schemas/shared.schema";
import { and, eq, getColumns, inArray } from "drizzle-orm";

type ProductRow = TicketProductSelect & {
  productName: string | null;
  productStock: number | null;
  productMinStock: number | null;
  productallowNegativeStock: boolean | null;
};

type PresentationRow = TicketProductPresentationSelect;

function createDefaultTicket(organizationId: string): Ticket {
  return {
    id: crypto.randomUUID(),
    name: "Ticket-1",
    isActive: true,
    organizationId,
    products: [],
  };
}

export class SqliteLocalTicketRepository implements LocalTicketRepository {
  constructor(private readonly db: DatabaseService) {}

  public async load(organizationId: string): Promise<Ticket[]> {
    const tickets = await this.db
      .select()
      .from(ticket)
      .where(eq(ticket.organizationId, organizationId));

    if (tickets.length === 0) {
      const defaultTicket = createDefaultTicket(organizationId);

      await this.db.insert(ticket).values(defaultTicket);

      return [defaultTicket];
    }

    const productRows = await this.db
      .select({
        ...getColumns(ticketProduct),
        product: getColumns(localProduct),
      })
      .from(ticketProduct)
      .leftJoin(localProduct, eq(localProduct.id, ticketProduct.productId))
      .where(
        and(
          eq(ticketProduct.organizationId, organizationId),
          inArray(
            ticketProduct.ticketId,
            tickets.map((t) => t.id)
          )
        )
      );

    const presentationRows = await this.db
      .select()
      .from(ticketProductPresentation)
      .where(
        and(
          eq(ticketProductPresentation.organizationId, organizationId),
          inArray(
            ticketProductPresentation.ticketProductId,
            productRows.map((p) => p.id)
          )
        )
      );

    const products: TicketProduct[] = productRows.map((p) => {
      const presentations = presentationRows.filter(
        (presentation) => presentation.ticketProductId === p.id
      );

      return {
        allowNegativeStock: p.product?.allowNegativeStock ?? true,
        minStock: p.product?.minStock ?? 0,
        name: p.product?.name ?? "N/A",
        productId: p.product?.id ?? null,
        stock: p.product?.stock ?? 0,
        type: p.type,
        id: p.id,
        ticketId: p.ticketId,
        presentations,
      };
    });

    const allTickets = tickets.map((ticketRow) => {
      const ticketProducts = products.filter(
        (product) => product.ticketId === ticketRow.id
      );

      return {
        ...ticketRow,
        products: ticketProducts,
      };
    });

    const someTicketIsActive = allTickets.some((t) => t.isActive);

    if (!someTicketIsActive) {
      allTickets[0]!.isActive = true;

      await this.db
        .update(ticket)
        .set({ isActive: true })
        .where(eq(ticket.id, allTickets[0]!.id));
    }

    return allTickets;
  }

  public async save(organizationId: string, tickets: Ticket[]): Promise<void> {
    const flatTickets: TicketSelect[] = [];
    const flatProducts: TicketProductSelect[] = [];
    const flatPresentations: TicketProductPresentationSelect[] = [];

    for (const ticketData of tickets) {
      const { products, ...ticketValues } = ticketData;

      flatTickets.push(ticketValues);

      for (const product of products) {
        const { presentations, ...productValues } = product;
        flatProducts.push({ ...productValues, organizationId: organizationId });

        for (const presentation of presentations) {
          flatPresentations.push({
            ...presentation,
            organizationId: organizationId,
            ticketProductId: productValues.id,
          });
        }
      }
    }

    await this.db.transaction((tx) => {
      tx.delete(ticketProductPresentation)
        .where(eq(ticketProductPresentation.organizationId, organizationId))
        .run();

      tx.delete(ticketProduct)
        .where(eq(ticketProduct.organizationId, organizationId))
        .run();

      tx.delete(ticket).where(eq(ticket.organizationId, organizationId)).run();

      tx.insert(ticket).values(flatTickets).run();

      if (flatProducts.length > 0) {
        tx.insert(ticketProduct).values(flatProducts).run();
      }

      if (flatPresentations.length > 0) {
        tx.insert(ticketProductPresentation).values(flatPresentations).run();
      }
    });
  }

  public async clear(organizationId: string): Promise<void> {
    await this.db
      .delete(ticket)
      .where(eq(ticket.organizationId, organizationId));
  }
}
