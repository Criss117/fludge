import { UUID } from "@fludge/utils/uuid";
import { CustomerDocument } from "../value-objects/document-type";
import { Status } from "@fludge/api/modules/shared/domain/value-objects/status";
import { CustomerBalance } from "../value-objects/customer-balance";
import type { CustomerSelect } from "@fludge/db/schema/customer.schema";
import type {
  CustomerDocumentTypeEnum,
  StatusEnum,
} from "@fludge/utils/enums/db-enums";
import { BadRequestError } from "@fludge/api/modules/shared/domain/exceptions/base-exception";

interface CreateCustomer {
  organizationId: UUID;
  createdBy: UUID;
  name: string;
  phone: string;
  email: string | null;
  creditLimit: number;
  documentType: CustomerDocumentTypeEnum;
  documentNumber: string;
}

interface UpdateCustomer {
  name?: string;
  phone?: string;
  email?: string | null;
  creditLimit?: number;
  documentType?: CustomerDocumentTypeEnum;
  documentNumber?: string;
  status?: StatusEnum;
}

export class Customer {
  constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private readonly _createdBy: UUID,

    private _name: string,
    private _phone: string,
    private _email: string | null,
    private _balance: CustomerBalance,
    private _document: CustomerDocument,
    private _status: Status,
    private _updatedAt: Date,
    private readonly _createdAt: Date,
  ) {}

  public static create(data: CreateCustomer) {
    const now = new Date();

    // documentType is always present; document only exists when documentNumber is also provided.
    const customerDocument = new CustomerDocument(
      data.documentType,
      data.documentNumber,
    );

    return new Customer(
      UUID.generate(),
      data.organizationId,
      data.createdBy,
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

  public update(data: UpdateCustomer) {
    if (data.name !== undefined) this._name = data.name;
    if (data.phone !== undefined) this._phone = data.phone;
    if (data.email !== undefined) this._email = data.email;

    if (data.creditLimit !== undefined) {
      this._balance = new CustomerBalance(
        this._balance.value.balance,
        data.creditLimit,
      );
    }

    if (data.documentType !== undefined || data.documentNumber !== undefined) {
      this._document = new CustomerDocument(
        data.documentType ?? this._document.value.type,
        data.documentNumber ?? this._document.value.number,
      );
    }

    if (data.status !== undefined) {
      this._status = new Status(data.status);
    }

    this._updatedAt = new Date();

    return this;
  }

  public charge(amount: number) {
    const { balance, creditLimit } = this._balance.value;

    const newBalance = balance + amount;

    if (creditLimit > 0 && newBalance > creditLimit) {
      throw new BadRequestError("api_errors.customers.credit_limit_exceeded");
    }

    this._balance = new CustomerBalance(newBalance, creditLimit);
    this._updatedAt = new Date();

    return this;
  }

  public static reconstitute(data: CustomerSelect) {
    return new Customer(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      UUID.fromString(data.createdBy),
      data.name,
      data.phone,
      data.email,
      new CustomerBalance(data.balance, data.creditLimit),
      new CustomerDocument(data.documentType, data.documentNumber),
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
      documentType: customerDocument?.type ?? "CC",
      documentNumber: customerDocument.number,
      status: this._status.value,
    };
  }
}
