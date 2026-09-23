import type { Product } from "../../../../catalog/products/domain/entities/product.entity";
import type { ProductRepository } from "../../../../catalog/products/domain/repositories/product.repository";
import type { EnsurePresentationsExistsService } from "./ensure-presentations-exists.service";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";
import { ProductPresentationNotFoundException } from "../../../../catalog/products/domain/exceptions/product-presentation-not-found.exception";
import { UUID } from "@fludge/utils/uuid";
import { ProductNotFoundException } from "../../../../catalog/products/domain/exceptions/product-not-found.exception";

type Item = {
  presentationId: string;
  quantity: number;
};

export class SaleProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly ensurePresentationsExistsService: EnsurePresentationsExistsService,
  ) {}

  public async execute(organizationId: string, items: Item[]) {
    const productsToSave: Product[] = [];

    if (items.length === 0) return productsToSave;

    const [exists, errExists] =
      await this.ensurePresentationsExistsService.execute(
        organizationId,
        items.map((item) => item.presentationId),
      );

    if (errExists)
      throw new InternalServerError(
        errExists,
        "api_errors.catalog.products_presentations.isr_on_find",
      );

    if (!exists || exists.size === 0)
      throw new ProductPresentationNotFoundException();

    const productIds = Array.from(exists.keys());

    const [productsFound, errFinding] =
      await this.productRepository.findManyByIds(organizationId, productIds);

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.products.isr_on_find",
      );

    if (productsFound.length !== productIds.length)
      throw new ProductNotFoundException();

    for (const [productId, presentationIds] of exists) {
      const presentations = items
        .filter((item) => presentationIds.includes(item.presentationId))
        .map((item) => ({
          id: item.presentationId,
          quantity: item.quantity,
        }));

      const product = productsFound.find((p) =>
        p.id.equals(UUID.fromString(productId)),
      )!;

      product.sale(presentations);

      productsToSave.push(product);
    }

    return productsToSave;
  }
}