import { UUID } from "@fludge/utils/uuid";
import { CustomerDocument } from "../value-objects/document-type";
import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import { CustomerBalance } from "../value-objects/customer-balance";
import type { CustomerSelect } from "@fludge/db/schema/customer.schema";
import type { CustomerDocumentTypeEnum } from "@fludge/utils/enums/db-enums";

interface CreateCustomer {
  organizationId: UUID;
  cratedBy: UUID;
  name: string;
  phone: string | null;
  email: string | null;
  creditLimit: number | null;
  documentType: CustomerDocumentTypeEnum | null;
  documentNumber: string | null;
}

export class Customer {
  constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private readonly _createdBy: UUID,

    private _name: string,
    private _phone: string | null,
    private _email: string | null,
    private _balance: CustomerBalance,
    private _document: CustomerDocument | null,
    private _status: Status,
    private _updatedAt: Date,
    private readonly _createdAt: Date,
  ) {}

  public static create(data: CreateCustomer) {
    const now = new Date();

    const customerDocument =
      data.documentType && data.documentNumber
        ? new CustomerDocument(data.documentType, data.documentNumber)
        : null;

    return new Customer(
      UUID.generate(),
      data.organizationId,
      data.cratedBy,
      data.name,
      data.phone,
      data.email,
      new CustomerBalance(0, data.creditLimit),
      customerDocument,
      new Status("active"),
      now,
      now,
    );
  }

  public static reconstitute(data: CustomerSelect) {
    const customerDocument =
      data.documentType && data.documentNumber
        ? new CustomerDocument(data.documentType, data.documentNumber)
        : null;

    return new Customer(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      UUID.fromString(data.createdBy),
      data.name,
      data.phone,
      data.email,
      new CustomerBalance(data.balance, data.creditLimit),
      customerDocument,
      new Status(data.status),
      new Date(data.updatedAt),
      new Date(data.createdAt),
    );
  }

  public get values(): CustomerSelect {
    const customerBalance = this._balance.value;
    const customerDocument = this._document?.value;

    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      createdBy: this._createdBy.toString(),
      name: this._name,
      phone: this._phone,
      email: this._email,
      balance: customerBalance.balance,
      creditLimit: customerBalance.creditLimit,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      documentType: customerDocument?.type ?? null,
      documentNumber: customerDocument?.number ?? null,
      status: this._status.value,
    };
  }
}
