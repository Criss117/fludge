import { describe, expect, it } from "bun:test";

import { CancelSaleCommand } from "@fludge/api/modules/sales/application/commands/cancel-sale.command";
import { SaleNotFoundException } from "@fludge/api/modules/sales/domain/exceptions/sale-not-found.exception";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";
import { CustomerNotFoundException } from "@fludge/api/modules/customer/domain/exceptions/customer-not-found.exception";
import { InMemorySaleRepository } from "@test/support/repositories/in-memory-sale.repository";
import { InMemoryProductRepository } from "@test/support/repositories/in-memory-product.repository";
import { InMemoryCustomerRepository } from "@test/support/repositories/in-memory-customer.repository";
import { FakeUpdateCustomerBalanceService } from "@test/support/fakes/fake-update-customer-balance.service";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildCustomer } from "@test/support/builders/customer.builder";
import { buildProduct } from "@test/support/builders/product.builder";
import { buildSale, makeCatalogItem, makeAdHocItem, SALE_PRESENTATION_ID } from "@test/support/builders/sale.builder";

function setup() {
  const saleRepository = new InMemorySaleRepository();
  const productRepository = new InMemoryProductRepository();
  const customerRepository = new InMemoryCustomerRepository();
  const updateCustomerBalance = new FakeUpdateCustomerBalanceService();

  const command = new CancelSaleCommand(
    saleRepository,
    productRepository,
    customerRepository,
    updateCustomerBalance as never,
  );

  return {
    saleRepository,
    productRepository,
    customerRepository,
    updateCustomerBalance,
    command,
  };
}

describe("CancelSaleCommand", () => {
  it("cancels a credit sale and refunds product stock", async () => {
    const { command, saleRepository, productRepository, updateCustomerBalance } = setup();
    const { org } = buildOrganization();

    const product = buildProduct({ organizationId: org.id.toString(), stock: 100 });
    await productRepository.save(product);
    const presentation = product.presentations[0]!;

    const customer = buildCustomer({ organizationId: org.id.toString() });
    const sale = buildSale({
      organizationId: org.id.toString(),
      paymentType: "credit",
      customerId: customer.values.id,
      items: [
        makeCatalogItem({
          organizationId: org.id.toString(),
          productId: product.id.toString(),
          presentationId: presentation.id.toString(),
          quantity: 2,
          unitPrice: 1000,
        }),
      ],
    });
    await saleRepository.save(sale);

    const updatedCustomer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 1000,
    });
    updateCustomerBalance.customer = updatedCustomer;

    const result = await command.execute(org, {
      id: sale.id.toString(),
      cancellationReason: "Error del cajero",
    });

    expect(result.sale.status).toBe("cancelled");
    expect(result.sale.cancelReason).toBe("Error del cajero");
    // stock 100 + 2*24 (conversionFactor) = 148
    expect(result.products[0]!.stock).toBe(148);
  });

  it("cancels a credit sale without a customer without touching customers", async () => {
    const { command, saleRepository, updateCustomerBalance } = setup();
    const { org } = buildOrganization();

    // credit sale sin customer -> status "open" -> cancelable.
    // Item ad-hoc (sin producto) para no tocar el catálogo.
    const sale = buildSale({
      organizationId: org.id.toString(),
      paymentType: "credit",
      items: [
        makeAdHocItem({ organizationId: org.id.toString() }),
      ],
    });
    await saleRepository.save(sale);

    const result = await command.execute(org, {
      id: sale.id.toString(),
      cancellationReason: "Error",
    });

    expect(result.sale.status).toBe("cancelled");
    expect(updateCustomerBalance.calls).toHaveLength(0);
  });

  it("cannot cancel a cash sale because it is already completed", async () => {
    const { command, saleRepository } = setup();
    const { org } = buildOrganization();

    // cash sale nace "completed" -> cancel() lanza CantChangeSaleStatusException
    const sale = buildSale({
      organizationId: org.id.toString(),
      paymentType: "cash",
    });
    await saleRepository.save(sale);

    await expect(
      command.execute(org, {
        id: sale.id.toString(),
        cancellationReason: "Error",
      }),
    ).rejects.toThrow("api_errors.sales.cant_change_status");
  });

  it("throws SaleNotFoundException when the sale does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();

    await expect(
      command.execute(org, {
        id: "00000000-0000-4000-8000-000000000099",
        cancellationReason: "Error",
      }),
    ).rejects.toThrow(SaleNotFoundException);
  });

  it("throws ProductNotFoundException when a product is missing", async () => {
    const { command, saleRepository } = setup();
    const { org } = buildOrganization();

    // El sale referencia un producto que no existe en el repo
    const sale = buildSale({
      organizationId: org.id.toString(),
      paymentType: "credit",
      items: [
        makeCatalogItem({
          organizationId: org.id.toString(),
          presentationId: SALE_PRESENTATION_ID,
          quantity: 1,
          unitPrice: 1000,
        }),
      ],
    });
    await saleRepository.save(sale);

    await expect(
      command.execute(org, {
        id: sale.id.toString(),
        cancellationReason: "Error",
      }),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it("throws CustomerNotFoundException when the customer balance update fails", async () => {
    const { command, saleRepository, updateCustomerBalance } = setup();
    const { org } = buildOrganization();

    const customer = buildCustomer({ organizationId: org.id.toString() });
    const sale = buildSale({
      organizationId: org.id.toString(),
      paymentType: "credit",
      customerId: customer.values.id,
      // Item ad-hoc: evita la búsqueda de producto para llegar al flujo de customer
      items: [makeAdHocItem({ organizationId: org.id.toString() })],
    });
    await saleRepository.save(sale);

    // El servicio de balance devuelve null -> no encontró al cliente
    updateCustomerBalance.customer = null;

    await expect(
      command.execute(org, {
        id: sale.id.toString(),
        cancellationReason: "Error",
      }),
    ).rejects.toThrow(CustomerNotFoundException);
  });
});