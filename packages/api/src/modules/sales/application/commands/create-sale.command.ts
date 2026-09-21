import { createSaleValidator } from "@fludge/utils/validators/sale.validators";
import type { z } from "zod";
import type { SaleRepository } from "@fludge/api/modules/sales/infrastructure/repositories/sale.repository";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { UUID } from "@fludge/utils/uuid";
import type { SaleSequenceRepository } from "@fludge/api/modules/sales/infrastructure/repositories/sale-sequense.repository";
import { Sale } from "@fludge/api/modules/sales/domain/entities/sale.entity";
import {
  InternalServerError,
  NotFoundError,
} from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import type { ProductRepository } from "@fludge/api/modules/catalog/products/domain/repositories/product.repository";
import type { SaleProductService } from "@fludge/api/modules/catalog/products/application/services/sale-product.service";
import { ProductPresentationNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-not-found.exception";
import type { CustomerRepository } from "@fludge/api/modules/customer/infrastructure/repositories/customer.repository";
import type { CreateSaleItem } from "@fludge/api/modules/sales/domain/entities/sale-item.entity";
import type { SaleItemSnapshotValue } from "@fludge/api/modules/sales/domain/value-objects/sale-item-snapshot";
import type { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";

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

  public async execute(
    activeOrganization: Organization,
    loggedUserId: string,
    cmd: CMD,
  ) {
    const loggerMember = activeOrganization.members.getMemberByUserId(
      UUID.fromString(loggedUserId),
    )!;

    let customer: Customer | null = null;

    if (cmd.customerId) {
      const [customerFind, errFindCustomer] = cmd.customerId
        ? await this.customerRepository.findById(
            activeOrganization.id.toString(),
            cmd.customerId,
          )
        : [null, null];

      if (errFindCustomer)
        throw new InternalServerError(
          errFindCustomer,
          "api_errors.customers.isr_on_find",
        );

      if (!customerFind)
        throw new NotFoundError("api_errors.customers.not_found");

      customer = customerFind!;
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
      activeOrganization,
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

    const saleItems: CreateSaleItem[] = cmd.items.map((item) => {
      if ("name" in item) {
        return {
          organizationId: activeOrganization.id,
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
        organizationId: activeOrganization.id,
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
        const [nextSecuence, errNextSequence] =
          await this.saleSequenceRepository.getNextSequence(
            activeOrganization.id.toString(),
            { tx },
          );

        if (errNextSequence) throw errNextSequence;

        const sale = Sale.create({
          createdBy: loggerMember.id,
          organizationId: activeOrganization.id,
          customerId: cmd.customerId ? UUID.fromString(cmd.customerId) : null,
          paymentType: cmd.paymentType,
          notes: cmd.notes,
          sequence: nextSecuence,
          items: saleItems,
        });

        const [, errSavingSale] = await this.saleRepository.save(sale, { tx });

        if (errSavingSale) throw errSavingSale;

        if (productsToSave.length > 0) {
          const [, errToSaveProducts] =
            await this.productRepository.saveOnlyProducts(productsToSave, {
              tx,
            });

          if (errToSaveProducts) throw errToSaveProducts;
        }

        // Solo las ventas a crédito cargan el saldo del cliente.
        if (customer && cmd.paymentType === "credit") {
          customer.increaseBalance(sale.values.total);

          const [, errSavingCustomer] = await this.customerRepository.save(
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
