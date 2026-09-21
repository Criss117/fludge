import { describe, expect, it } from "bun:test";

import { UpdateProductCommand } from "@fludge/api/modules/catalog/products/application/commands/update-product.command";
import { ProductNotFoundException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-not-found.exception";
import { CategoryNotFoundException } from "@fludge/api/modules/catalog/categories/domain/exceptions/category-not-found.exception";
import { ProductAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-already-exists.exception";
import { ProductPresentationAlreadyExistsException } from "@fludge/api/modules/catalog/products/domain/exceptions/product-presentation-already-exists.exception";
import { InternalServerError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";
import { InMemoryProductRepository } from "@test/support/repositories/in-memory-product.repository";
import { FakeProductUniquenessValidator } from "@test/support/fakes/fake-product-uniqueness-validator";
import { FakeEnsureCategoryExistsService } from "@test/support/fakes/fake-ensure-category-exists.service";
import { buildOrganization } from "@test/support/builders/organization.builder";
import { buildProduct } from "@test/support/builders/product.builder";
import { UUID } from "@fludge/utils/uuid";

type PresentationCmd = {
  id: string;
  name: string;
  barcode: string | undefined;
  conversionFactor: number;
  priceSale: number;
  pricePurchase: number | undefined;
  priceWholesale: number | undefined;
  status: "active" | "inactive" | "discontinued";
};

type Cmd = {
  id: string;
  name: string;
  categoryId: string | undefined;
  description: string;
  stock: number;
  minStock: number;
  allowNegativeStock: boolean;
  status: "active" | "inactive" | "discontinued";
  presentations: PresentationCmd[];
};

function setup() {
  const repository = new InMemoryProductRepository();
  const validator = new FakeProductUniquenessValidator();
  const ensureCategory = new FakeEnsureCategoryExistsService();

  const command = new UpdateProductCommand(
    ensureCategory as never,
    validator as never,
    repository,
  );

  return { repository, validator, ensureCategory, command };
}

function seedProduct(
  repository: InMemoryProductRepository,
  orgId: string,
  options?: { categoryId?: string | null; name?: string },
) {
  const product = buildProduct({
    categoryId: options?.categoryId ?? null,
    name: options?.name ?? "Agua",
    organizationId: orgId,
  });

  repository.save(product);

  return product;
}

function validCmd(
  existing: ReturnType<typeof buildProduct>,
  overrides?: Partial<Cmd>,
): Cmd {
  const presentation = existing.presentations[0]!;

  return {
    id: existing.id.toString(),
    name: existing.values.name,
    categoryId: existing.values.categoryId ?? undefined,
    description: existing.values.description,
    stock: existing.values.stock,
    minStock: existing.values.minStock,
    allowNegativeStock: existing.values.allowNegativeStock,
    status: existing.values.status,
    presentations: [
      {
        id: presentation.id.toString(),
        name: presentation.values.name,
        barcode: presentation.barcode ?? undefined,
        conversionFactor: presentation.values.conversionFactor,
        priceSale: presentation.values.priceSale,
        pricePurchase: presentation.values.pricePurchase ?? undefined,
        priceWholesale: presentation.values.priceWholesale ?? undefined,
        status: "active",
      },
    ],
    ...overrides,
  };
}

describe("UpdateProductCommand", () => {
  it("updates the product name and regenerates slug", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString());

    const result = await command.execute(
      ownerUserId,
      org,
      validCmd(product, { name: "Agua Sin Gas" }),
    );

    expect(result.name).toBe("Agua Sin Gas");
    expect(result.slug).toBe("agua-sin-gas");
  });

  it("updates stock and status", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString());

    const result = await command.execute(
      ownerUserId,
      org,
      validCmd(product, {
        stock: 250,
        minStock: 25,
        status: "discontinued",
      }),
    );

    expect(result.stock).toBe(250);
    expect(result.minStock).toBe(25);
    expect(result.status).toBe("discontinued");
  });

  it("validates category existence when changing the category", async () => {
    const { command, repository, ensureCategory } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString());
    const newCategoryId = UUID.generate().toString();

    await command.execute(
      ownerUserId,
      org,
      validCmd(product, { categoryId: newCategoryId }),
    );

    expect(ensureCategory.calls).toHaveLength(1);
    expect(ensureCategory.calls[0]!.categoryIds).toEqual([newCategoryId]);
  });

  it("throws CategoryNotFoundException when the new category does not exist", async () => {
    const { command, repository, ensureCategory } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString());

    ensureCategory.exists = false;

    await expect(
      command.execute(
        ownerUserId,
        org,
        validCmd(product, {
          categoryId: UUID.generate().toString(),
        }),
      ),
    ).rejects.toThrow(CategoryNotFoundException);
  });

  it("throws ProductNotFoundException when the product does not exist", async () => {
    const { command, repository } = setup();
    const { org, ownerUserId } = buildOrganization();

    const ghost = buildProduct({ organizationId: org.id.toString() });

    await expect(
      command.execute(
        ownerUserId,
        org,
        validCmd(ghost, { id: "00000000-0000-4000-8000-000000000000" }),
      ),
    ).rejects.toThrow(ProductNotFoundException);

    expect(repository.getAll(org.id.toString())).toHaveLength(0);
  });

  it("throws ProductAlreadyExistsException when the new name is taken", async () => {
    const { command, repository, validator } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString());

    validator.result = { nameTaken: true, slugTaken: false };

    await expect(
      command.execute(
        ownerUserId,
        org,
        validCmd(product, { name: "Tomado" }),
      ),
    ).rejects.toThrow(ProductAlreadyExistsException);
  });

  it("validates uniqueness excluding the current product id", async () => {
    const { command, repository, validator } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString(), {
      name: "Agua",
    });

    await command.execute(
      ownerUserId,
      org,
      validCmd(product, { name: "AGUA" }),
    );

    expect(validator.calls).toHaveLength(1);
    expect(validator.calls[0]!.excludeId).toBe(product.id.toString());
  });

  it("renames to a slug-preserving variant because the current product is excluded", async () => {
    const { command, repository, validator } = setup();
    const { org, ownerUserId } = buildOrganization();
    // slugify normaliza a minúsculas: "Agua" -> "agua", "AGUA" -> "agua"
    const product = seedProduct(repository, org.id.toString(), {
      name: "Agua",
    });

    const result = await command.execute(
      ownerUserId,
      org,
      validCmd(product, { name: "AGUA" }),
    );

    expect(validator.calls[0]!.excludeId).toBe(product.id.toString());
    expect(result.name).toBe("AGUA");
    expect(result.slug).toBe("agua");
  });

  it("throws ProductPresentationAlreadyExistsException when the barcode is taken", async () => {
    const { command, repository, validator } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString());

    validator.barcodeResult = { barcodesTaken: true };

    await expect(
      command.execute(ownerUserId, org, validCmd(product)),
    ).rejects.toThrow(ProductPresentationAlreadyExistsException);
  });

  it("throws InternalServerError when uniqueness validation fails", async () => {
    const { command, repository, validator } = setup();
    const { org, ownerUserId } = buildOrganization();
    const product = seedProduct(repository, org.id.toString());

    validator.error = new Error("db down");

    await expect(
      command.execute(
        ownerUserId,
        org,
        validCmd(product, { name: "Otro" }),
      ),
    ).rejects.toThrow(InternalServerError);
  });
});