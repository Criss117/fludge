import { generateCustomerContainer } from "@fludge/client/application/customer/container";
import { databaseService } from "../db";
import { NativeSyncCustomerRepository } from "../db/repositories/native-sync-customer.repository";

const syncCustomerRepository = new NativeSyncCustomerRepository(databaseService);

export const customerContainer = generateCustomerContainer({
  syncCustomerRepository,
});