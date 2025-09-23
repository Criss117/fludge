import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  business,
  employees,
  groups,
  users,
  InsertBusiness,
  InsertEmployee,
  InsertGroup,
  InsertUser,
  SelectBusiness,
  SelectGroup,
  SelectUser,
  InsertCategory,
  categories,
} from '@repo/db';
import { fakerES as faker } from '@faker-js/faker';
import { allPermissions } from '@repo/core/value-objects/permission';
import { hashPassword } from 'src/shared/utils/passwords.utils';

type Options = {
  totaRootUsers: number;
  totalEmployeesPerRoot: number;
  totalBusinessesPerRoot: number;
  groupsPerBusiness: number;
};

const defaultOptions: Options = {
  totaRootUsers: 4,
  totalEmployeesPerRoot: 5,
  totalBusinessesPerRoot: 5,
  groupsPerBusiness: 4,
};

@Injectable()
export class SeedService {
  constructor(
    private readonly logger: Logger,
    @Inject(DBSERVICE) private readonly db: LibSQLDatabase,
  ) {}

  public async clearDB() {
    await this.db.delete(categories);
    await this.db.delete(employees);
    await this.db.delete(groups);
    await this.db.delete(business);
    await this.db.delete(users);
  }

  public async seed(options = defaultOptions) {
    this.logger.log('Seeding database...');
    const { groupsPerBusiness, totaRootUsers, totalBusinessesPerRoot } =
      options;

    const { noRootUsers, rootUsers } = await this.insertUsers(totaRootUsers);
    const insertedBusiness = await this.insertBusinesses(
      rootUsers,
      totalBusinessesPerRoot,
    );
    const insertedGroups = await this.insertGroups(
      insertedBusiness,
      groupsPerBusiness,
    );

    const insertedEmployees = await this.insertEmployees(
      insertedGroups,
      noRootUsers,
      insertedBusiness,
    );

    const insertedCategories = await this.insertCategories(insertedBusiness);

    this.logger.log('Seeding database done');
    return {
      users: {
        rootUsers: rootUsers,
        noRootUsers: noRootUsers,
      },
      businesses: insertedBusiness,
      groups: insertedGroups,
      employees: insertedEmployees,
      categories: insertedCategories,
    };
  }

  private async insertUsers(totalUsers: number) {
    const hashedPassword = await hashPassword('holiwis');
    const mainRootUser: InsertUser = {
      firstName: 'Cristian',
      lastName: 'Viveros',
      email: 'cristian@fludge.dev',
      password: hashedPassword,
      isRoot: true,
      username: 'crviveros',
    };

    const mainNoRootUser: InsertUser = {
      firstName: 'Cristian',
      lastName: 'Viveros',
      password: hashedPassword,
      isRoot: false,
      username: 'cristian',
    };

    const rootUsersToInser: InsertUser[] = Array.from({
      length: totalUsers,
    }).map((_, i) => {
      if (i === 0) {
        return mainRootUser;
      }

      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: hashedPassword,
        isRoot: true,
        username: faker.internet.username(),
      };
    });

    const noRootUsersToInsert: InsertUser[] = Array.from({
      length: rootUsersToInser.length * 10,
    }).map((_, i) => {
      if (i === 0) {
        return mainNoRootUser;
      }

      return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: hashedPassword,
        isRoot: false,
        username: faker.internet.username(),
      };
    });

    const insertRootUsersPromise = this.db
      .insert(users)
      .values(rootUsersToInser)
      .returning();

    const insertNoRootUsersPromise = this.db
      .insert(users)
      .values(noRootUsersToInsert)
      .returning();

    const [rootUsers, noRootUsers] = await Promise.all([
      insertRootUsersPromise,
      insertNoRootUsersPromise,
    ]);

    return {
      rootUsers: rootUsers,
      noRootUsers: noRootUsers,
    };
  }

  private async insertBusinesses(
    insertedUsers: SelectUser[],
    totalBusinessesPerRoot: number,
  ) {
    const businessesToInsert: InsertBusiness[] = Array.from({
      length: insertedUsers.length * totalBusinessesPerRoot,
    }).map(() => {
      return {
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        nit: faker.finance.iban(),
        rootUserId: faker.helpers.arrayElement(insertedUsers).id,
      };
    });

    return this.db.insert(business).values(businessesToInsert).returning();
  }

  private async insertGroups(
    insertedBusinesses: SelectBusiness[],
    groupsPerBusiness: number,
  ) {
    const groupsToInsert: InsertGroup[] = Array.from({
      length: insertedBusinesses.length * groupsPerBusiness,
    }).map(() => {
      return {
        businessId: faker.helpers.arrayElement(insertedBusinesses).id,
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        permissions: faker.helpers.arrayElements(allPermissions),
      };
    });

    return this.db.insert(groups).values(groupsToInsert).returning();
  }

  private async insertEmployees(
    insertedGroups: SelectGroup[],
    insertedNoRootUsers: SelectUser[],
    insertedBusinesses: SelectBusiness[],
  ) {
    const employeesToInsert: InsertEmployee[] = Array.from({
      length: insertedNoRootUsers.length,
    }).map((_, i) => {
      const business = faker.helpers.arrayElement(insertedBusinesses);
      const group = insertedGroups.find(
        (group) => group.businessId === business.id,
      );

      if (!group) {
        throw new Error('Group not found');
      }

      return {
        businessId: business.id,
        groupIds: [group.id],
        userId: insertedNoRootUsers[i].id,
      };
    });

    return this.db.insert(employees).values(employeesToInsert).returning();
  }

  private async insertCategories(insertedBusinesses: SelectBusiness[]) {
    const categoriesToInsert: InsertCategory[] = Array.from({
      length: insertedBusinesses.length * 20,
    }).map(() => {
      return {
        businessId: faker.helpers.arrayElement(insertedBusinesses).id,
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        parentId: null,
      };
    });

    const categoriesInserted = await this.db
      .insert(categories)
      .values(categoriesToInsert)
      .returning();

    const subCategoriesToInsert: InsertCategory[] = Array.from({
      length: categoriesToInsert.length * 2,
    }).map(() => {
      const parentCategory = faker.helpers.arrayElement(categoriesInserted);

      return {
        businessId: parentCategory.businessId,
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        parentId: parentCategory.id,
      };
    });

    const subcategoriesInserted = await this.db
      .insert(categories)
      .values(subCategoriesToInsert)
      .returning();

    return [...categoriesInserted, ...subcategoriesInserted];
  }
}
