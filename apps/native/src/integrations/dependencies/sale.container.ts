import { generateSaleContainer } from "@fludge/client/application/sales/container";
import { databaseService } from "@/integrations/db";
import { SqliteLocalTicketRepository } from "@/modules/sales/repositories/sqlite-local-ticket.repository";
import { NativeSyncSaleRepository } from "../db/repositories/native-sync-sale.repository";

const localTicketRepository = new SqliteLocalTicketRepository(databaseService);
const syncSaleRepository = new NativeSyncSaleRepository(databaseService);

export const salesContainer = generateSaleContainer({
  localTicketRepository,
  syncSaleRepository,
});
