import { describe, expect, it, mock } from "bun:test";
import { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";
import { Group } from "@fludge/api/modules/iam/organization/domain/entities/group.entity";
import { Permissions, type AppStatement } from "@fludge/utils/permissions";
import { UUID } from "@fludge/utils/uuid";
import { err } from "@fludge/utils/trycatch";

mock.module("@fludge/db", () => ({
  buildConflictUpdateColumn: mock(() => ({})),
  jsonObject: mock(() => undefined),
}));

const { PgOrganizationRepository } = await import(
  "@fludge/api/modules/iam/organization/infrastructure/repositories/pg-organization.repository"
);

function makeChain(result: unknown, error?: Error) {
  const chain: Record<string, any> = {};
  for (const method of ["from", "innerJoin", "leftJoin", "where", "orderBy", "groupBy"])
    chain[method] = mock(() => chain);
  chain.then = (resolve: Function, reject?: Function) =>
    error ? Promise.reject(error).catch(reject) : Promise.resolve(result).then(resolve, reject);
  return chain;
}

function makeDb(result: unknown = [], error?: Error) {
  const chain = makeChain(result, error);
  const insertChain: Record<string, any> = {};
  for (const method of ["values", "onConflictDoUpdate", "onConflictDoNothing", "returning"])
    insertChain[method] = mock(() => insertChain);
  const tx = { insert: mock(() => insertChain) };
  return {
    select: mock(() => chain),
    transaction: mock((callback: (tx: typeof tx) => unknown) => callback(tx)),
    chain,
    tx,
    insertChain,
  };
}

function makeOrganization() {
  const ownerId = UUID.generate();
  const organization = Organization.create({
    name: "Acme Corporation",
    legalName: "Acme Corporation LLC",
    taxId: "TAX-1",
    address: "Main Street",
    phone: "555-0100",
    owner: { userId: ownerId, assignedBy: null, role: "owner" },
  });
  const owner = organization.members.owner!;
  const group = Group.create({
    name: "Editors",
    description: "Editors group",
    permissions: Permissions.create({ groups: ["read"] }),
    createdBy: owner.id,
  });
  organization.groups.addGroup(group);
  organization.addGroupMember(group.id, owner.id, owner.id);
  return organization;
}

function rowFromOrganization(organization: Organization) {
  const values = organization.values;
  return {
    ...values,
    members: JSON.stringify(values.members),
    groups: JSON.stringify(values.groups.map((group) => ({
      ...group,
      permissions: JSON.stringify(group.permissions satisfies AppStatement),
    }))),
    groupMembers: JSON.stringify(values.groupMembers),
  };
}

describe("PgOrganizationRepository", () => {
  it("returns ok(null) when no organization row is found", async () => {
    const db = makeDb([]);
    const result = await new PgOrganizationRepository(db as any).findOneById("user-1", "org-1");

    expect(result).toEqual([null, null]);
    expect(db.chain.innerJoin).toHaveBeenCalledTimes(1);
    expect(db.chain.leftJoin).toHaveBeenCalledTimes(3);
  });

  it("reconstitutes dates, permissions, members, groups, and group members", async () => {
    const organization = makeOrganization();
    const db = makeDb([rowFromOrganization(organization)]);

    const result = await new PgOrganizationRepository(db as any).findOneById(
      organization.members.owner!.userId.toString(),
      organization.id.toString(),
    );

    expect(result[1]).toBeNull();
    const restored = result[0]!;
    expect(restored).toBeInstanceOf(Organization);
    expect(restored.members.values(restored.id)[0].createdAt).toBeInstanceOf(Date);
    expect(restored.groups.values(restored.id)[0].permissions).toEqual({ groups: ["read"] });
    expect(restored.values.groupMembers[0].createdAt).toBeInstanceOf(Date);
  });

  it("returns the query error instead of throwing", async () => {
    const failure = new Error("database unavailable");
    const result = await new PgOrganizationRepository(makeDb([], failure) as any).findOneById("user-1", "org-1");

    expect(result).toEqual(err(failure));
  });

  it("saves all populated organization collections in one transaction", async () => {
    const organization = makeOrganization();
    const db = makeDb();
    const result = await new PgOrganizationRepository(db as any).save(organization);

    expect(result).toEqual([undefined, null]);
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(db.tx.insert).toHaveBeenCalledTimes(4);
    expect(db.insertChain.onConflictDoUpdate).toHaveBeenCalledTimes(3);
    expect(db.insertChain.onConflictDoNothing).toHaveBeenCalledTimes(1);
  });

  it("saves only the requested collection", async () => {
    const db = makeDb();
    const result = await new PgOrganizationRepository(db as any).save(makeOrganization(), { onlySave: ["members"] });

    expect(result).toEqual([undefined, null]);
    expect(db.tx.insert).toHaveBeenCalledTimes(1);
  });

  it("skips empty collection inserts", async () => {
    const db = makeDb();
    const organization = {
      values: {
        id: UUID.generate().toString(),
        name: "Acme",
        slug: "acme",
        logo: null,
        metadata: null,
        legalName: "Acme LLC",
        taxId: "TAX-1",
        address: "Main Street",
        phone: "555-0100",
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
        groups: [],
        groupMembers: [],
      },
    };

    await new PgOrganizationRepository(db as any).save(organization, {
      onlySave: ["members", "groups", "groupMembers"],
    });

    expect(db.tx.insert).not.toHaveBeenCalled();
  });

  it("returns the transaction error", async () => {
    const failure = new Error("transaction failed");
    const db = makeDb();
    db.transaction.mockRejectedValue(failure);

    const result = await new PgOrganizationRepository(db as any).save(makeOrganization());

    expect(result).toEqual(err(failure));
  });
});
