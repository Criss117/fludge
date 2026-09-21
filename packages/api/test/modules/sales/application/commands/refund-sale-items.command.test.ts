import { describe, expect, it } from "bun:test";

import { RefundSaleItemsCommand } from "@fludge/api/modules/sales/application/commands/refund-sale-items.command";
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
import { buildSale, makeCatalogItem, makeAdHocItem } from "@test/support/builders/sale.builder";

function setup() {
  const saleRepository = new InMemorySaleRepository();
  const productRepository = new InMemoryProductRepository();
  const customerRepository = new InMemoryCustomerRepository();
  const updateCustomerBalance = new FakeUpdateCustomerBalanceService();

  const command = new RefundSaleItemsCommand(
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

describe("RefundSaleItemsCommand", () => {
  it("refunds items and restores product stock", async () => {
    const { command, saleRepository, productRepository } = setup();
    const { org } = buildOrganization();

    const product = buildProduct({ organizationId: org.id.toString(), stock: 100 });
    await productRepository.save(product);
    const presentation = product.presentations[0]!;

    const sale = buildSale({
      organizationId: org.id.toString(),
      paymentType: "cash",
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
    const itemId = sale.items.values[0]!.id.toString();

    const result = await command.execute(org, {
      id: sale.id.toString(),
      itemIds: [itemId],
    });

    expect(result.sale.items[0]!.status).toBe("inactive");
    // stock 100 + 2*24 (conversionFactor) = 148
    expect(result.products[0]!.stock).toBe(148);
  });

  it("decreases customer balance for credit sales with a customer", async () => {
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
    const itemId = sale.items.values[0]!.id.toString();

    const updatedCustomer = buildCustomer({
      organizationId: org.id.toString(),
      balance: 500,
    });
    updateCustomerBalance.customer = updatedCustomer;

    const result = await command.execute(org, {
      id: sale.id.toString(),
      itemIds: [itemId],
    });

    expect(updateCustomerBalance.calls).toHaveLength(1);
    expect(updateCustomerBalance.calls[0]!.amount).toBe(5000); // 1 * 5000 (item ad-hoc)
    expect(result.sale.items[0]!.status).toBe("inactive");
  });

  it("throws SaleNotFoundException when the sale does not exist", async () => {
    const { command } = setup();
    const { org } = buildOrganization();

    await expect(
      command.execute(org, {
        id: "00000000-0000-4000-8000-000000000099",
        itemIds: ["00000000-0000-4000-8000-000000000099"],
      }),
    ).rejects.toThrow(SaleNotFoundException);
  });

  it("throws ProductNotFoundException when a product is missing", async () => {
    const { command, saleRepository } = setup();
    const { org } = buildOrganization();

    const sale = buildSale({ organizationId: org.id.toString(), paymentType: "cash" });
    await saleRepository.save(sale);
    const itemId = sale.items.values[0]!.id.toString();

    // El producto referenciado no existe en el repo
    await expect(
      command.execute(org, {
        id: sale.id.toString(),
        itemIds: [itemId],
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
    });
    await saleRepository.save(sale);
    const itemId = sale.items.values[0]!.id.toString();

    updateCustomerBalance.customer = null;

    await expect(
      command.execute(org, {
        id: sale.id.toString(),
        itemIds: [itemId],
      }),
    ).rejects.toThrow(CustomerNotFoundException);
  });
});