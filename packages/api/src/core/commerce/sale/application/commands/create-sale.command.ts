import type { z } from "zod";
import {
  Sale,
  type CreateSale,
} from "../../../../commerce/sale/domain/entities/sale.entity";
import type { SaleRepository } from "../../../../commerce/sale/domain/repositories/sale.repository";
import type { SaleSequenceRepository } from "../../../../commerce/sale/domain/repositories/sale-sequence.repository";
import type { CustomerRepository } from "../../../../commerce/customer/domain/repositories/customer.repository";
import type { ProductRepository } from "../../../../catalog/products/domain/repositories/product.repository";
import type { SaleProductService } from "../../../../catalog/products/application/services/sale-product.service";
import type { SaleItemSnapshotValue } from "../../../../commerce/sale/domain/value-objects/sale-item-snapshot";
import type { Customer } from "../../../../commerce/customer/domain/entities/customer.entity";
import type { UserAuthContext } from "../../../../iam/domain/entities/user-auth-context.entity";
import { InternalServerError } from "../../../../shared/exceptions/base-exception";
import { CustomerNotFoundException } from "../../../../commerce/customer/domain/exceptions/customer-not-found.exception";
import { ProductPresentationNotFoundException } from "../../../../catalog/products/domain/exceptions/product-presentation-not-found.exception";
import { UUID } from "@fludge/utils/uuid";
import { createSaleValidator } from "@fludge/utils/validators/sale.validators";

export const createSaleCommand = createSaleValidator;

type CMD = z.infer<typeof createSaleCommand>;

export class CreateSaleCommand {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly saleSequenceRepository: SaleSequenceRepository,
    private readonly productRepository: ProductRepository,
    private readonly saleProductService: SaleProductService,
    private readonly customerRepository: CustomerRepository,
  ) {}

  public async execute(authContext: UserAuthContext, cmd: CMD) {
    const organizationId = authContext.organizationId.toString();

    let customer: Customer | null = null;

    if (cmd.customerId) {
      const [customerFind, errFindCustomer] =
        await this.customerRepository.findById(organizationId, cmd.customerId);

      if (errFindCustomer)
        throw new InternalServerError(
          errFindCustomer,
          "api_errors.customers.isr_on_find",
        );

      if (!customerFind) throw new CustomerNotFoundException();

      customer = customerFind;
    }

    const itemsWithPresentationId: {
      presentationId: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of cmd.items) {
      if ("presentationId" in item) {
        itemsWithPresentationId.push({
          presentationId: item.presentationId,
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    const productsToSave = await this.saleProductService.execute(
      organizationId,
      itemsWithPresentationId,
    );

    // Los items de catálogo congelan la identidad del producto y su
    // presentación para que la venta no dependa del catálogo actual.
    const snapshotsByPresentationId = new Map<string, SaleItemSnapshotValue>();

    for (const product of productsToSave) {
      const productValues = product.values;

      for (const presentation of productValues.presentations) {
        snapshotsByPresentationId.set(presentation.id, {
          product: {
            id: productValues.id,
            name: productValues.name,
            slug: productValues.slug,
          },
          presentation: {
            id: presentation.id,
            name: presentation.name,
            barcode: presentation.barcode,
            conversionFactor: presentation.conversionFactor,
          },
        });
      }
    }

    const saleItems: CreateSale["items"] = cmd.items.map((item) => {
      if ("name" in item) {
        return {
          organizationId: authContext.organizationId,
          productId: null,
          productPresentationId: null,
          productSnapshot: null,
          name: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
        };
      }

      const snapshot = snapshotsByPresentationId.get(item.presentationId);

      if (!snapshot) throw new ProductPresentationNotFoundException();

      return {
        organizationId: authContext.organizationId,
        productId: UUID.fromString(snapshot.product.id),
        productPresentationId: UUID.fromString(snapshot.presentation.id),
        productSnapshot: snapshot,
        name: snapshot.presentation.name,
        unitPrice: item.price,
        quantity: item.quantity,
      };
    });

    const [newSale, errTransaction] = await this.saleRepository.transaction(
      async (tx) => {
        const [nextSequence, errNextSequence] =
          await this.saleSequenceRepository.getNextSequence(organizationId, {
            tx,
          });

        if (errNextSequence) throw errNextSequence;

        const sale = Sale.create({
          createdBy: authContext.member.id,
          organizationId: authContext.organizationId,
          customerId: cmd.customerId ? UUID.fromString(cmd.customerId) : null,
          paymentType: cmd.paymentType,
          notes: cmd.notes,
          sequence: nextSequence,
          items: saleItems,
        });

        const [, errSavingSale] = await this.saleRepository.insert(sale, {
          tx,
        });

        if (errSavingSale) throw errSavingSale;

        if (productsToSave.length > 0) {
          const [, errProducts] = await this.productRepository.updateMany(
            productsToSave,
            { tx },
          );

          if (errProducts) throw errProducts;
        }

        // Solo las ventas a crédito cargan el saldo del cliente.
        if (customer && cmd.paymentType === "credit") {
          customer.increaseBalance(sale.values.total);

          const [, errSavingCustomer] = await this.customerRepository.update(
            customer,
            { tx },
          );

          if (errSavingCustomer) throw errSavingCustomer;
        }

        return sale;
      },
    );

    if (errTransaction)
      throw new InternalServerError(
        errTransaction,
        "api_errors.sales.isr_on_save",
      );

    return {
      sale: newSale.values,
      products: productsToSave.map((p) => p.values),
      customer: customer?.values ?? null,
    };
  }
}
