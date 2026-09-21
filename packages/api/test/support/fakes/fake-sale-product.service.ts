import { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";

type Item = {
  presentationId: string;
  quantity: number;
};

/**
 * Test double de SaleProductService.
 * No se testea este service; se inyecta para controlar qué productos
 * devuelve al crear una venta. El service real devuelve Product[] directo.
 */
export class FakeSaleProductService {
  public products: Product[] = [];
  public error: Error | null = null;

  public calls: Array<{ organizationId: string; items: Item[] }> = [];

  public async execute(
    activeOrganization: Organization,
    items: Item[],
  ): Promise<Product[]> {
    this.calls.push({
      organizationId: activeOrganization.id.toString(),
      items,
    });

    if (this.error) throw this.error;

    return this.products;
  }
}