import { generateSaleContainer } from "@fludge/client/application/sales/container";
import { databaseService } from "@/integrations/db";
import { SqliteLocalTicketRepository } from "@/modules/sales/repositories/sqlite-local-ticket.repository";
import { NativeSaleRepository } from "@/modules/sales/repositories/native-sale.repository";
import { NativeSyncSaleRepository } from "../db/repositories/native-sync-sale.repository";

const localTicketRepository = new SqliteLocalTicketRepository(databaseService);
const syncSaleRepository = new NativeSyncSaleRepository(databaseService);
const saleRepository = new NativeSaleRepository(databaseService);

export const salesContainer = generateSaleContainer({
  localTicketRepository,
  syncSaleRepository,
  saleRepository,
});
