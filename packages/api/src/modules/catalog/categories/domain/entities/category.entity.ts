import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import { Slug } from "@fludge/utils/slugify";
import { UUID } from "@fludge/utils/uuid";
import type { CategorySelect } from "@fludge/db/schema/catalog.schema";

export type CreateCategory = {
  name: string;
  organizationId: UUID;
  createdBy: UUID | null;
  description?: string;
};

export type UpdateCategory = {
  name?: string;
  description?: string | null;
  status?: Status;
};

export class Category {
  private constructor(
    private readonly _id: UUID,
    private _name: string,
    private _slug: Slug,
    private _description: string | null,
    private _status: Status,
    private readonly _organizationId: UUID,
    private readonly _createdBy: UUID | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(data: CreateCategory): Category {
    const now = new Date();

    return new Category(
      UUID.generate(),
      data.name,
      new Slug(data.name),
      data.description ?? null,
      new Status("active"),
      data.organizationId,
      data.createdBy,
      now,
      now,
    );
  }

  public static reconstitute(data: CategorySelect): Category {
    return new Category(
      UUID.fromString(data.id),
      data.name,
      new Slug(data.slug),
      data.description,
      new Status(data.status),
      UUID.fromString(data.organizationId),
      data.createdBy ? UUID.fromString(data.createdBy) : null,
      data.createdAt,
      data.updatedAt,
    );
  }

  public get id(): UUID {
    return this._id;
  }

  public get status(): Status {
    return this._status;
  }

  public update(data: UpdateCategory): void {
    if (data.name !== undefined && data.name !== this._name) {
      this._name = data.name;
      this._slug = new Slug(data.name);
    }

    if (data.description !== undefined) {
      this._description = data.description;
    }

    if (data.status !== undefined) {
      this._status = data.status;
    }

    this._touch();
  }

  public archive(): void {
    this._status = new Status("inactive");
    this._touch();
  }

  public activate(): void {
    this._status = new Status("active");
    this._touch();
  }

  /** Verifica si esta categoría pertenece a la organización dada (autorización a nivel de dominio). */
  public belongsTo(organizationId: UUID): boolean {
    return this._organizationId.equals(organizationId);
  }

  private _touch(): void {
    this._updatedAt = new Date();
  }

  // --- Serialización ---

  public get values(): CategorySelect {
    return {
      id: this._id.toString(),
      name: this._name,
      slug: this._slug.toString(),
      description: this._description,
      organizationId: this._organizationId.toString(),
      createdBy: this._createdBy?.toString() ?? null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: this._status.value,
    };
  }
}
