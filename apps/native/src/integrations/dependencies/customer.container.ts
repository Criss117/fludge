import { generateCustomerContainer } from "@fludge/client/application/customer/container";
import { databaseService } from "../db";
import { NativeSyncCustomerRepository } from "../db/repositories/native-sync-customer.repository";
import { NativeCustomerRepository } from "@/modules/customer/repositories/native-customer.repository";

const customerRepository = new NativeCustomerRepository(databaseService);
const syncCustomerRepository = new NativeSyncCustomerRepository(databaseService);

export const customerContainer = generateCustomerContainer({
  customerRepository,
  syncCustomerRepository,
});