import type { Product } from "../../../../catalog/products/domain/entities/product.entity";
import type { ProductRepository } from "../../../../catalog/products/domain/repositories/product.repository";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";

export interface RefundProductInput {
  productId: string;
  presentations: {
    presentationId: string;
    quantity: number;
    conversionFactor: number;
  }[];
}

/**
 * Revierte el stock de productos cuando se cancela una venta.
 * - Agrupa los datos por productId
 * - Busca los productos (si no existen, los omite — no es fallo)
 * - Ejecuta product.refund() en cada uno
 * - Retorna los productos modificados para persistir
 */
export class RefundProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  public async execute(
    organizationId: string,
    items: RefundProductInput[],
  ): Promise<Product[]> {
    if (items.length === 0) return [];

    const productIds = [...new Set(items.map((item) => item.productId))];

    const [products, errFind] = await this.productRepository.findManyByIds(
      organizationId,
      productIds,
    );

    if (errFind)
      throw new InternalServerError(
        errFind,
        "api_errors.catalog.products.isr_on_find",
      );

    // Si un producto ya no existe, no es caso de fallo — se omite
    const productMap = new Map(products.map((p) => [p.id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      product.refund(item.presentations);
    }

    return Array.from(productMap.values());
  }
}
