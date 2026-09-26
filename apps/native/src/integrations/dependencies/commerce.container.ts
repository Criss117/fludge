import { generateCommerceContainer } from "@fludge/client/application/commerce/container";
import { databaseService } from "@/integrations/db";
import { NativeCustomerRepository } from "@/modules/commerce/repositories/native-customer.repository";
import { NativeSaleRepository } from "@/modules/commerce/repositories/native-sale.repository";
import { SqliteLocalTicketRepository } from "@/modules/commerce/repositories/sqlite-local-ticket.repository";
import { NativeSyncCommerceRepository } from "../db/repositories/native-sync-commerce.repository";

const saleRepository = new NativeSaleRepository(databaseService);
const customerRepository = new NativeCustomerRepository(
  databaseService,
  saleRepository
);
const localTicketRepository = new SqliteLocalTicketRepository(databaseService);
const syncCommerceRepository = new NativeSyncCommerceRepository(databaseService);

export const commerceContainer = generateCommerceContainer({
  customerRepository,
  saleRepository,
  localTicketRepository,
  syncCommerceRepository,
});