import type { z } from "zod";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/domain/repositories/product.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import type { SaleRepository } from "@fludge/api/modules/sales/domain/repositories/sale.repository";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { cancelSaleValidator } from "@fludge/utils/validators/sale.validators";
import { SaleNotFoundException } from "@fludge/api/modules/sales/domain/exceptions/sale-not-found.exception";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";
import type { Product } from "@fludge/api/modules/catalog/products/domain/entities/product.entity";
import type { UpdateCustomerBalanceService } from "@fludge/api/modules/customer/application/services/update-customer-balance.service";
import type { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";
import { CustomerNotFoundException } from "@fludge/api/modules/customer/domain/exceptions/customer-not-found.exception";
import type { CustomerRepository } from "@fludge/api/modules/customer/domain/repositories/customer.repository";

export const cancelSaleCommand = cancelSaleValidator;

type CMD = z.infer<typeof cancelSaleCommand>;

export class CancelSaleCommand {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly productRepository: ProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly updateCustomerBalanceService: UpdateCustomerBalanceService,
  ) {}

  public async execute(activeOrganization: Organization, cmd: CMD) {
    const [existingSale, errFindSale] = await this.saleRepository.findById(
      activeOrganization.id.toString(),
      cmd.id,
    );

    if (errFindSale)
      throw new InternalServerError(
        errFindSale,
        "api_errors.sales.isr_on_find",
      );

    if (!existingSale) throw new SaleNotFoundException();

    existingSale.cancel(cmd.cancellationReason);

    const productIds = existingSale.items.productIds;

    const productToSave: Product[] = [];

    if (productIds.length > 0) {
      const [products, errFindProducts] =
        await this.productRepository.findManyByIds(
          activeOrganization.id.toString(),
          productIds,
        );

      if (errFindProducts)
        throw new InternalServerError(
          errFindProducts,
          "api_errors.catalog.products.isr_on_find",
        );

      if (products.length !== productIds.length)
        throw new ProductNotFoundException();

      for (const item of existingSale.values.items) {
        const productSnapshot = item.productSnapshot;

        if (!productSnapshot) continue;

        const product = products.find(
          (p) => p.id.toString() === productSnapshot.product.id,
        );

        if (!product) continue;

        product.refund({
          presentationId: productSnapshot.presentation.id,
          quantity: item.quantity,
          conversionFactor: productSnapshot.presentation.conversionFactor,
        });
      }

      productToSave.push(...products);
    }

    let customerToSave: Customer | null = null;

    if (existingSale.values.customerId !== null) {
      const [updatedCustomer, errUpdateCustomer] =
        await this.updateCustomerBalanceService.decrease(
          activeOrganization,
          existingSale.values.customerId,
          existingSale.values.total,
        );

      if (errUpdateCustomer)
        throw new InternalServerError(
          errUpdateCustomer,
          "api_errors.customers.isr_on_update",
        );

      if (!updatedCustomer) throw new CustomerNotFoundException();

      customerToSave = updatedCustomer;
    }

    await this.saleRepository.transaction(async (tx) => {
      await this.saleRepository.save(existingSale, { tx });

      if (productToSave.length > 0) {
        const [, errToSaveProducts] =
          await this.productRepository.saveOnlyProducts(productToSave, {
            tx,
          });

        if (errToSaveProducts) throw errToSaveProducts;
      }

      if (customerToSave !== null) {
        const [, errSavingCustomer] = await this.customerRepository.save(
          customerToSave,
          { tx },
        );

        if (errSavingCustomer) throw errSavingCustomer;
      }
    });

    return {
      sale: existingSale.values,
      products: productToSave.map((p) => p.values),
      customer: customerToSave?.values ?? null,
    };
  }
}
