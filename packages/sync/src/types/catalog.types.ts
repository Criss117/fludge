import type {
  LocalCategory,
  LocalProduct,
} from "@fludge/db/local-schemas/shared.schema";

/** Timestamps más recientes del cliente por entidad. */
export type CatalogLastSyncedAt = {
  category: Date | null;
  product: Date | null;
};

/** Resultado del sync de IAM — entidades agrupadas como el aggregate root. */
export type CatalogSyncResult = {
  categories: LocalCategory[];
  products: LocalProduct[];
};
