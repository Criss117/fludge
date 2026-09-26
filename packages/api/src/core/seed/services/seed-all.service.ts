import type { z } from "zod";
import type { SeedCatalogService } from "./seed-catalog.service";
import type { SeedCommerceService } from "./seed-commerce.service";
import type { SeedIamService } from "./seed-iam.service";
import type { SeedUsersService } from "./seed-users.service";
import type { seedAllValidator } from "@fludge/utils/validators/seed.validators";

type SeedAllInput = z.infer<typeof seedAllValidator>;

export class SeedAllService {
  constructor(
    private readonly seedUsers: SeedUsersService,
    private readonly seedIam: SeedIamService,
    private readonly seedCatalog: SeedCatalogService,
    private readonly seedCommerce: SeedCommerceService,
  ) {}

  public async clearAllTables(): Promise<void> {
    await this.seedCommerce.clearCommerceTables();
    await this.seedCatalog.clearCatalogTables();
    await this.seedIam.clearIamTables();
    await this.seedUsers.clearAuthTables();
  }

  public async seed(headers: Headers, input: SeedAllInput) {
    // 1. Limpiar todas las tablas en orden (respetando FKs)
    //    commerce → catalog → iam → auth
    await this.clearAllTables();

    // 3. Insertar en orden de dependencias
    const usersResult = await this.seedUsers.seed(headers, input.users);

    const iamResult = await this.seedIam.seed(headers, input.iam);

    const catalogResult = await this.seedCatalog.seed(input.catalog);

    const commerceResult = await this.seedCommerce.seed(input.commerce);

    return {
      users: usersResult,
      iam: iamResult,
      catalog: catalogResult,
      commerce: commerceResult,
    };
  }
}
