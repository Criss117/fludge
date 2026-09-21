import { describe, expect, it } from "bun:test";

import { CreateSaleCommand } from "@fludge/api/modules/sales/application/commands/create-sale.command";
import { NotFoundError, InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { ProductPresentationNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-not-found.exception";
import { InMemorySaleRepository } from "@test/support/repositories/in-memory-sale.repository";
import { InMemorySaleSequenceRepository } from "@test/support/repositories/in-memory-sale-sequence.repository";
import { InMemoryProductRepository } from "@test/support/repositories/in-memory-product.repository";
import { InMemoryCustomerRepository } from "@test/support/repositories/in-memory-customer.repository";
import { FakeSaleProductService } from "@test/support/fakes/fake-sale-product.service";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildCustomer } from "@test/support/builders/customer.builder";
import { buildProduct } from "@test/support/builders/product.builder";

type CatalogItem = {
  presentationId: string;
  quantity: number;
  price: number;
};

type AdHocItem = {
  name: string;
  quantity: number;
  price: number;
};

type Cmd = {
  customerId?: string;
  paymentType: "cash" | "credit";
  notes: string;
  items: Array<CatalogItem | AdHocItem>;
};

function setup() {
  const saleRepository = new InMemorySaleRepository();
  const saleSequenceRepository = new InMemorySaleSequenceRepository();
  const productRepository = new InMemoryProductRepository();
  const customerRepository = new InMemoryCustomerRepository();
  const saleProductService = new FakeSaleProductService();

  const command = new CreateSaleCommand(
    saleRepository,
    saleSequenceRepository,
    productRepository,
    saleProductService as never,
    customerRepository,
  );

  return {
    saleRepository,
    saleSequenceRepository,
    productRepository,
    customerRepository,
    saleProductService,
    command,
  };
}

function seedProductWithPresentation(
  productRepository: InMemoryProductRepository,
  orgId: string,
) {
  const product = buildProduct({
    organizationId: orgId,
    barcodes: ["7501234567890"],
  });

  productRepository.save(product);

  const presentationId = product.presentations[0]!.id.toString();

  return { product, presentationId };
}

function validCmd(presentationId?: string, overrides?: Partial<Cmd>): Cmd {
  return {
    paymentType: "cash",
    notes: "",
    items: presentationId
      ? [
          {
            presentationId,
            quantity: 2,
            price: 1000,
          },
        ]
      : [],
    ...overrides,
  };
}

describe("CreateSaleCommand", () => {
  it("creates a cash sale with catalog items", async () => {
    const { command, saleRepository, saleSequenceRepository, productRepository, saleProductService } = setup();
    const { org, ownerUserId } = buildOrganization();
    const { product, presentationId } = seedProductWithPresentation(productRepository, org.id.toString());
    saleProductService.products = [product];

    const result = await command.execute(org, ownerUserId, validCmd(presentationId));

    expect(result.sale.paymentType).toBe("cash");
    expect(result.sale.status).toBe("completed");
    expect(result.sale.total).toBe(2000);
    expect(result.sale.items).toHaveLength(1);
    expect(result.products).toHaveLength(1);
    expect(saleRepository.getAll(org.id.toString())).toHaveLength(1);
    expect(saleSequenceRepository.getNextSequence(org.id.toString())).resolves.toEqual([2, null]);
  });

  it("creates a credit sale as open with customer balance increase", async () => {
    const { command, customerRepository, saleProductService, productRepository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const customer = buildCustomer({ organizationId: org.id.toString() });
    await customerRepository.save(customer);
    const { product, presentationId } = seedProductWithPresentation(productRepository, org.id.toString());
    saleProductService.products = [product];

    const result = await command.execute(
      org,
      ownerUserId,
      validCmd(presentationId, { paymentType: "credit", customerId: customer.values.id }),
    );

    expect(result.sale.status).toBe("open");
    expect(result.customer).not.toBeNull();

    const persisted = customerRepository.getAll(org.id.toString())[0]!;
    expect(persisted.values.balance).toBe(2000);
  });

  it("creates a sale with ad-hoc items", async () => {
    const { command, saleProductService } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(
      org,
      ownerUserId,
      validCmd(undefined, {
        items: [{ name: "Servicio", quantity: 1, price: 5000 }],
      }),
    );

    expect(saleProductService.calls).toHaveLength(1);
    expect(result.sale.total).toBe(5000);
    expect(result.sale.items[0]!.productId).toBeNull();
  });

  it("throws NotFoundError when the customer does not exist", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    await expect(
      command.execute(
        org,
        ownerUserId,
        validCmd(undefined, {
          paymentType: "credit",
          customerId: "00000000-0000-4000-8000-000000000099",
        }),
      ),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ProductPresentationNotFoundException when the snapshot is missing", async () => {
    const { command } = setup();
    const { org, ownerUserId } = buildOrganization();

    // saleProductService devuelve vacío -> no hay snapshots,
    // pero el item de catálogo pide un presentationId
    const ghostPresentationId = "00000000-0000-4000-8000-000000000099";

    await expect(
      command.execute(org, ownerUserId, validCmd(ghostPresentationId)),
    ).rejects.toThrow(ProductPresentationNotFoundException);
  });

  it("throws InternalServerError when the transaction fails", async () => {
    const { saleRepository, saleSequenceRepository, productRepository, customerRepository, saleProductService } = setup();
    const { org, ownerUserId } = buildOrganization();
    const { product, presentationId } = seedProductWithPresentation(productRepository, org.id.toString());
    saleProductService.products = [product];

    // Rompemos la secuencia para forzar el fallo dentro del transaction
    saleSequenceRepository.setNext(org.id.toString(), -1);

    const failingCommand = new CreateSaleCommand(
      saleRepository,
      saleSequenceRepository,
      productRepository,
      saleProductService as never,
      customerRepository,
    );

    await expect(
      failingCommand.execute(org, ownerUserId, validCmd(presentationId)),
    ).rejects.toThrow(InternalServerError);
  });
});