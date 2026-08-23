import type { GroupSelect } from "@fludge/db/schema/iam.schema";
import { Permissions } from "@fludge/utils/permissions";
import { Slug } from "@fludge/utils/slugify";
import { UUID } from "@fludge/utils/uuid";

export type CreateGroup = {
  name: string;
  description: string | null;
  permissions: Permissions;
  createdBy: UUID | null;
};

export type UpdateGroup = Partial<Omit<CreateGroup, "createdBy">>;

export class Group {
  private constructor(
    private readonly _id: UUID,
    private _name: string,
    private _slug: Slug,
    private _description: string | null,
    private _permissions: Permissions,
    private readonly _createdBy: UUID | null,

    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  public static create(values: CreateGroup) {
    const now = new Date();
    return new Group(
      UUID.generate(),
      values.name,
      new Slug(values.name),
      values.description,
      values.permissions,
      values.createdBy,
      now,
      now,
      null,
    );
  }

  public static reconstitute(values: GroupSelect) {
    return new Group(
      UUID.fromString(values.id),
      values.name,
      new Slug(values.name),
      values.description,
      Permissions.fromUntyped(values.permissions),
      values.createdBy ? UUID.fromString(values.createdBy) : null,
      new Date(values.createdAt),
      values.updatedAt,
      values.deletedAt,
    );
  }

  public nameIsTaken(name: string) {
    const slug = new Slug(name);

    return this._name === name || this._slug.equals(slug);
  }

  public update(values: UpdateGroup) {
    if (values.name) {
      this._name = values.name;
      this._slug = new Slug(values.name);
    }

    if (values.description !== undefined)
      this._description = values.description;
    if (values.permissions !== undefined)
      this._permissions = values.permissions;

    this._updatedAt = new Date();
  }

  public disable() {
    if (this._deletedAt) return;

    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  public enable() {
    if (!this._deletedAt) return;

    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  public get isActive() {
    return this._deletedAt === null;
  }

  public get id() {
    return this._id;
  }

  public get permissions() {
    return this._permissions;
  }

  public get values(): Omit<GroupSelect, "organizationId"> {
    return {
      id: this._id.toString(),
      name: this._name,
      slug: this._slug.toString(),
      description: this._description,
      permissions: this._permissions.value,
      createdBy: this._createdBy?.toString() ?? null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
