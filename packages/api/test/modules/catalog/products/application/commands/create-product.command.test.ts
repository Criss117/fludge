import { describe, expect, it } from "bun:test";

import { CreateProductCommand } from "@fludge/api/modules/catalog/products/application/commands/create-product.command";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryProductRepository } from "@test/support/repositories/in-memory-product.repository";
import { FakeProductUniquenessValidator } from "@test/support/fakes/fake-product-uniqueness-validator";
import { FakeEnsureCategoryExistsService } from "@test/support/fakes/fake-ensure-category-exists.service";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { UUID } from "@fludge/utils/uuid";

type PresentationCmd = {
  name: string;
  barcode: string | undefined;
  conversionFactor: number;
  priceSale: number;
  pricePurchase: number | undefined;
  priceWholesale: number | undefined;
};

type Cmd = {
  name: string;
  categoryId: string | undefined;
  description: string;
  stock: number;
  minStock: number;
  allowNegativeStock: boolean;
  presentations: PresentationCmd[];
};

function setup() {
  const repository = new InMemoryProductRepository();
  const validator = new FakeProductUniquenessValidator();
  const ensureCategory = new FakeEnsureCategoryExistsService();

  const command = new CreateProductCommand(
    ensureCategory as never,
    validator as never,
    repository,
  );

  return { repository, validator, ensureCategory, command };
}

function validCmd(overrides?: Partial<Cmd>): Cmd {
  return {
    name: "Agua",
    categoryId: undefined,
    description: "Botella de agua 500ml",
    stock: 100,
    minStock: 10,
    allowNegativeStock: false,
    presentations: [
      {
        name: "Caja",
        barcode: "7501234567890",
        conversionFactor: 24,
        priceSale: 1000,
        pricePurchase: 800,
        priceWholesale: 900,
      },
    ],
    ...overrides,
  };
}

describe("CreateProductCommand", () => {
  it("creates a product and persists it", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();

    const result = await command.execute(ownerUserId, org, validCmd());

    expect(result.name).toBe("Agua");
    expect(result.slug).toBe("agua");
    expect(result.status).toBe("active");
    expect(result.stock).toBe(100);
    expect(result.presentations).toHaveLength(1);
    expect(repository.getAll(org.id.toString())).toHaveLength(1);
  });

  it("validates category existence when a categoryId is provided", async () => {
    const { command, ensureCategory } = setup();
    const { org, ownerUserId } = buildOrganization();
    const categoryId = UUID.generate().toString();

    await command.execute(
      ownerUserId,
      org,
      validCmd({ categoryId }),
    );

    expect(ensureCategory.calls).toHaveLength(1);
    expect(ensureCategory.calls[0]!.categoryIds).toEqual([categoryId]);
  });

  it("throws CategoryNotFoundException when the category does not exist", async () => {
    const { command, ensureCategory } = setup();
    const { org, ownerUserId } = buildOrganization();

    ensureCategory.exists = false;

    await expect(
      command.execute(
        ownerUserId,
        org,
        validCmd({ categoryId: UUID.generate().toString() }),
      ),
    ).rejects.toThrow(CategoryNotFoundException);
  });

  it("throws ProductAlreadyExistsException when the name is taken", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.result = { nameTaken: true, slugTaken: false };

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      ProductAlreadyExistsException,
    );
  });

  it("throws ProductPresentationAlreadyExistsException when the barcode is taken", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.barcodeResult = { barcodesTaken: true };

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      ProductPresentationAlreadyExistsException,
    );
  });

  it("throws InternalServerError when uniqueness validation fails", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.error = new Error("db down");

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      InternalServerError,
    );
  });

  it("throws InternalServerError when barcode validation fails", async () => {
    const { command, validator } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.barcodeError = new Error("db down");

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      InternalServerError,
    );
  });

  it("throws InternalServerError when category validation fails", async () => {
    const { command, ensureCategory } = setup();
    const { org, ownerUserId } = buildOrganization();

    ensureCategory.error = new Error("db down");

    await expect(
      command.execute(
        ownerUserId,
        org,
        validCmd({ categoryId: UUID.generate().toString() }),
      ),
    ).rejects.toThrow(InternalServerError);
  });

  it("does not persist when the name is taken", async () => {
    const { command, validator, repository } = setup();
    const { org, ownerUserId } = buildOrganization();

    validator.result = { nameTaken: true, slugTaken: false };

    await expect(command.execute(ownerUserId, org, validCmd())).rejects.toThrow(
      ProductAlreadyExistsException,
    );

    expect(repository.getAll(org.id.toString())).toHaveLength(0);
  });
});