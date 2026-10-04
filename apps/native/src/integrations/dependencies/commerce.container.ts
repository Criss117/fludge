import { generateCommerceContainer } from "@fludge/client/commerce/container";
import { databaseService } from "@/integrations/db";
import { NativeCustomerRepository } from "@/modules/commerce/repositories/native-customer.repository";
import { NativeSaleRepository } from "@/modules/commerce/repositories/native-sale.repository";
import { NativeLocalTicketRepository } from "@/modules/commerce/repositories/native-local-ticket.repository";
import { NativeSyncCommerceRepository } from "../db/repositories/native-sync-commerce.repository";

const saleRepository = new NativeSaleRepository(databaseService);
const customerRepository = new NativeCustomerRepository(databaseService);
const localTicketRepository = new NativeLocalTicketRepository(databaseService);
const syncCommerceRepository = new NativeSyncCommerceRepository(
  databaseService
);

export const commerceContainer = generateCommerceContainer({
  customerRepository,
  saleRepository,
  localTicketRepository,
  syncCommerceRepository,
});
