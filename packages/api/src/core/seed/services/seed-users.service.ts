import type { AuthService } from "@fludge/auth";
import type { DatabaseService } from "@fludge/db";
import {
  account,
  session,
  user,
  verification,
} from "@fludge/db/schema/auth.schema";
import { faker } from "@faker-js/faker/locale/es_MX";
import { tryCatch } from "@fludge/utils/trycatch";
import type { z } from "zod";
import type { seedUsersValidator } from "@fludge/utils/validators/seed.validators";

type SeedUsersInput = z.infer<typeof seedUsersValidator>;

type SeedUsersResult = {
  roots: { id: string; email: string; name: string }[];
};

export class SeedUsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  public async seed(headers: Headers, input: SeedUsersInput) {
    const commonPassword = "holiwis123";
    const roots: SeedUsersResult["roots"] = [];

    // Create root users
    for (let i = 0; i < input.rootUsers; i++) {
      const name = faker.person.fullName();
      const email = `root${i}@fludge.com`;

      const [result, err] = await tryCatch(
        this.authService.api.signUpEmail({
          body: {
            email,
            password: commonPassword,
            isRoot: true,
            phone: faker.phone.number(),
            name,
          },
          headers,
        }),
      );

      if (err) throw new Error("Error creating root user", { cause: err });
      roots.push({ id: result.user.id, email, name });
    }

    return roots;
  }

  public async clearAuthTables(): Promise<void> {
    const [_, err] = await tryCatch(
      this.db.transaction(async (tx) => {
        await tx.delete(verification);
        await tx.delete(account);
        await tx.delete(session);
        await tx.delete(user);
      }),
    );

    if (err) throw new Error("Error clearing auth tables", { cause: err });
  }
}
