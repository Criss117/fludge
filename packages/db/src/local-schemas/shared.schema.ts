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
  customerPayment,
  salePayment,
} from "../schema";

// IAM
export const localUser = user;
export const localOrganization = organization;
export const localMember = member;
export const localGroup = group;
export const localGroupMember = groupMember;

export type LocalUser = typeof localUser.$inferSelect;

export type LocalOrganization = typeof localOrganization.$inferSelect;

export type LocalMember = typeof localMember.$inferSelect;

type LocalGroupMemberSelect = typeof localGroupMember.$inferSelect;
export type LocalGroup = typeof localGroup.$inferSelect & {
  members: LocalGroupMemberSelect[];
};

// Catalog
export const localCategory = category;
export const localProduct = product;
export const localProductPresentation = productPresentation;

export type LocalCategorySelect = typeof localCategory.$inferSelect;

export type LocalProductPresentationSelect =
  typeof localProductPresentation.$inferSelect;
export type LocalProductSelect = typeof localProduct.$inferSelect & {
  presentations: LocalProductPresentationSelect[];
};

// Ecommerse
export const localCustomer = customer;
export const localCustomerPayment = customerPayment;

export const localSale = sale;
export const localSaleItem = saleItem;
export const localSalePayment = salePayment;

type LocalCustomerPaymentSelect = typeof localCustomerPayment.$inferSelect;
export type LocalCustomerSelect = typeof localCustomer.$inferSelect & {
  payments: LocalCustomerPaymentSelect[];
};

export type LocalSaleItemSelect = typeof localSaleItem.$inferSelect;
export type LocalSalePaymentSelect = typeof localSalePayment.$inferSelect;
export type LocalSaleSelect = typeof localSale.$inferSelect & {
  items: LocalSaleItemSelect[];
  payments: LocalSalePaymentSelect[];
};
