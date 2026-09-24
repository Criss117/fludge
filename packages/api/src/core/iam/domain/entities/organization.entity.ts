import { Status } from "@fludge/api/core/shared/value-objects/status";
import type { OrganizationSelect } from "@fludge/db/schema/iam.schema";
import { Slug } from "@fludge/utils/slugify";
import { UUID } from "@fludge/utils/uuid";

type CreateOrganization = {
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
};

export type UpdateOrganization = Partial<Omit<CreateOrganization, "taxId">>;

export class Organization {
  private constructor(
    private readonly _id: UUID,
    private readonly _taxId: string,

    private _name: string,
    private _slug: Slug,
    private _legalName: string,
    private _address: string,
    private _phone: string,

    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _status: Status,
  ) {}

  public static create(values: CreateOrganization) {
    const now = new Date();

    return new Organization(
      UUID.generate(),
      values.taxId,
      values.name,
      new Slug(values.name),
      values.legalName,
      values.address,
      values.phone,
      now,
      now,
      new Status("active"),
    );
  }

  public static reconstitute(values: OrganizationSelect) {
    return new Organization(
      UUID.fromString(values.id),
      values.taxId,
      values.name,
      new Slug(values.name),
      values.legalName,
      values.address,
      values.phone,
      values.createdAt,
      values.updatedAt,
      new Status(values.status),
    );
  }

  public get status() {
    return this._status;
  }

  public get id() {
    return this._id;
  }

  public get values(): OrganizationSelect {
    return {
      id: this._id.toString(),
      taxId: this._taxId,
      name: this._name,
      slug: this._slug.toString(),
      legalName: this._legalName,
      address: this._address,
      phone: this._phone,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: this._status.value,
    };
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public update(values: UpdateOrganization) {
    if (values.name) {
      this._name = values.name;
      this._slug = new Slug(values.name);
    }

    if (values.legalName) this._legalName = values.legalName;
    if (values.address) this._address = values.address;
    if (values.phone) this._phone = values.phone;

    this.touch();
  }
}
