import type { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import type { EnsurePresentationsExistsService } from "./ensure-presentations-exists.service";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { ProductPresentationNotFoundException } from "../../domain/exceptions/product-presentation-not-found.exception";
import { UUID } from "@fludge/utils/uuid";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/infrastructure/repositories/product.repository";

type Item = {
  presentationId: string;
  quantity: number;
};

export class SaleProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly ensurePresentationsExistsService: EnsurePresentationsExistsService,
  ) {}

  public async execute(activeOrganization: Organization, items: Item[]) {
    const productsToSave: Product[] = [];

    const presentationsIds = items.map((item) => ({
      id: item.presentationId,
      quantity: item.quantity,
    }));

    if (presentationsIds.length === 0) return productsToSave;

    const [exists, errExists] =
      await this.ensurePresentationsExistsService.execute(
        activeOrganization.id.toString(),
        presentationsIds.map((p) => p.id),
      );

    if (errExists)
      throw new InternalServerError(
        errExists,
        "api_errors.catalog.products_presentations.isr_on_find",
      );

    if (exists.size === 0) throw new ProductPresentationNotFoundException();

    const productsIds = Array.from(exists.keys());

    const [productsFind, errFinding] =
      await this.productRepository.findManyByIds(
        activeOrganization.id.toString(),
        productsIds,
      );

    if (errFinding)
      throw new InternalServerError(
        errFinding,
        "api_errors.catalog.products.isr_on_find",
      );

    if (productsFind.length !== productsIds.length)
      throw new ProductNotFoundException();

    for (const [productId, presentationIds] of exists) {
      const presentations = presentationsIds.filter((p) =>
        presentationIds.includes(p.id),
      );

      const product = productsFind.find((p) =>
        p.id.equals(UUID.fromString(productId)),
      )!;

      product.sale(presentations);

      productsToSave.push(product);
    }

    return productsToSave;
  }
}
