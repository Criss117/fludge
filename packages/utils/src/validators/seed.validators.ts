import { z } from "zod";

export const seedUsersValidator = z.object({
  rootUsers: z.number().int().min(0).default(2),
});

export const seedIamValidator = z.object({
  organizationsPerRoot: z.number().int().min(1).default(2),
  membersPerOrganization: z.number().int().min(0).default(10),
  groupPerOrganization: z.number().int().min(0).default(10),
});

export const seedCatalogValidator = z.object({
  categoriesPerOrganization: z.number().int().min(0).default(10),
  productsPerCategory: z.number().int().min(0).default(100),
  presentationsPerProduct: z.number().int().min(1).default(5),
});

export const seedCommerceValidator = z.object({
  customersPerOrganization: z.number().int().min(0).default(20),
  salesPerCustomer: z.number().int().min(0).default(20),
  itemsPerSale: z.number().int().min(1).default(20),
});

export const seedAllValidator = z.object({
  users: seedUsersValidator,
  iam: seedIamValidator,
  catalog: seedCatalogValidator,
  commerce: seedCommerceValidator,
});
