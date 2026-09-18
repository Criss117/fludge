import {
  category,
  customer,
  group,
  groupMember,
  member,
  organization,
  product,
  productPresentation,
  user,
  sale,
  saleItem,
} from "../schema";

// IAM
export const localUser = user;
export const localOrganization = organization;
export const localMember = member;
export const localGroup = group;
export const localGroupMember = groupMember;

// Catalog
export const localCategory = category;
export const localProduct = product;
export const localProductPresentation = productPresentation;

// Customer
export const localCustomer = customer;

// Sale
export const localSale = sale;
export const localSaleItem = saleItem;

export type LocalUserSelect = typeof localUser.$inferSelect;
export type LocalOrganizationSelect = typeof localOrganization.$inferSelect;
export type LocalMemberSelect = typeof localMember.$inferSelect;
export type LocalGroupSelect = typeof localGroup.$inferSelect;
export type LocalGroupMemberSelect = typeof localGroupMember.$inferSelect;

export type LocalCategorySelect = typeof localCategory.$inferSelect;
export type LocalProductSelect = typeof localProduct.$inferSelect;
export type LocalProductPresentationSelect =
  typeof localProductPresentation.$inferSelect;

export type LocalCustomerSelect = typeof localCustomer.$inferSelect;

export type LocalSaleSelect = typeof localSale.$inferSelect;
export type LocalSaleItemSelect = typeof localSaleItem.$inferSelect;
