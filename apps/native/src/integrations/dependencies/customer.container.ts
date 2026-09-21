import { generateCustomerContainer } from "@fludge/client/application/customer/container";
import { databaseService } from "../db";
import { NativeSyncCustomerRepository } from "../db/repositories/native-sync-customer.repository";
import { NativeCustomerRepository } from "@/modules/customer/repositories/native-customer.repository";
import { salesContainer } from "./sale.container";

const customerRepository = new NativeCustomerRepository(
  databaseService,
  salesContainer.repositories.saleRepository
);
const syncCustomerRepository = new NativeSyncCustomerRepository(
  databaseService
);

export const customerContainer = generateCustomerContainer({
  customerRepository,
  syncCustomerRepository,
});
