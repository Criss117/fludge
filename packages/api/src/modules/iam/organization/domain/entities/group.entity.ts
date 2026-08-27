import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import type { StatusEnum } from "@fludge/db/schema/enums";
import type { GroupSelect } from "@fludge/db/schema/iam.schema";
import { Permissions } from "@fludge/utils/permissions/index";
import { Slug } from "@fludge/utils/slugify";
import { UUID } from "@fludge/utils/uuid";

export type CreateGroup = {
  name: string;
  description: string | null;
  permissions: Permissions;
  createdBy: UUID | null;
};

export type UpdateGroup = Partial<Omit<CreateGroup, "createdBy">> & {
  status?: StatusEnum;
};

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
    private _status: Status,
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
      new Status("active"),
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
      new Status(values.status),
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

    if (values.status !== undefined) this._status = new Status(values.status);

    this._updatedAt = new Date();
  }

  public setInactive() {
    if (this._status.isInactive()) return;

    this._status = new Status("inactive");
    this._updatedAt = new Date();
  }

  public setActive() {
    if (this._status.isActive()) return;

    this._status = new Status("active");
    this._updatedAt = new Date();
  }

  public get status() {
    return this._status;
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
      status: this._status.value,
    };
  }
}
