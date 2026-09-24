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

export type LocalCategory = typeof localCategory.$inferSelect;

export type LocalProductPresentation =
  typeof localProductPresentation.$inferSelect;
export type LocalProduct = typeof localProduct.$inferSelect & {
  presentations: LocalProductPresentation[];
};

// Ecommerse
export const localCustomer = customer;
export const localCustomerPayment = customerPayment;

export const localSale = sale;
export const localSaleItem = saleItem;
export const localSalePayment = salePayment;

type LocalCustomerPayment = typeof localCustomerPayment.$inferSelect;
export type LocalCustomer = typeof localCustomer.$inferSelect & {
  payments: LocalCustomerPayment[];
};

export type LocalSaleItem = typeof localSaleItem.$inferSelect;
export type LocalSalePayment = typeof localSalePayment.$inferSelect;
export type LocalSale = typeof localSale.$inferSelect & {
  items: LocalSaleItem[];
  payments: LocalSalePayment[];
};
