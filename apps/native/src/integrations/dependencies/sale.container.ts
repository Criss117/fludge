import { generateSaleContainer } from "@fludge/client/application/sales/container";
import { databaseService } from "@/integrations/db";
import { SqliteLocalTicketRepository } from "@/modules/sales/repositories/sqlite-local-ticket.repository";

const localTicketRepository = new SqliteLocalTicketRepository(databaseService);

export const salesContainer = generateSaleContainer({
  localTicketRepository,
});
