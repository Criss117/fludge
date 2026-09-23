import { Status } from "../../../../shared/value-objects/status";
import type { SalePaymentSelect } from "@fludge/db/schema/sales.schema";
import { UUID } from "@fludge/utils/uuid";

interface CreateSalePayment {
  customerPaymentId: UUID;
  amount: number;
  createdBy: UUID;
  organizationId: UUID;
  saleId: UUID;
}

export class SalePayment {
  constructor(
    private readonly _id: UUID,
    private readonly _saleId: UUID,
    private readonly _customerPaymentId: UUID,
    private readonly _organizationId: UUID,

    private readonly _amount: number,
    private readonly _createdBy: UUID,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _status: Status,
  ) {}

  public static create(data: CreateSalePayment) {
    const now = new Date();
    return new SalePayment(
      UUID.generate(),
      data.saleId,
      data.customerPaymentId,
      data.organizationId,
      data.amount,
      data.createdBy,
      now,
      now,
      new Status("active"),
    );
  }

  public static reconstitute(data: SalePaymentSelect): SalePayment {
    return new SalePayment(
      UUID.fromString(data.id),
      UUID.fromString(data.saleId),
      UUID.fromString(data.customerPaymentId),
      UUID.fromString(data.organizationId),
      data.amount,
      UUID.fromString(data.createdBy),
      new Date(data.createdAt),
      new Date(data.updatedAt),
      new Status(data.status),
    );
  }

  public get id() {
    return this._id;
  }

  public get customerPaymentId() {
    return this._customerPaymentId;
  }

  public get amount() {
    return this._amount;
  }

  public get createdAt() {
    return this._createdAt;
  }

  public get values(): SalePaymentSelect {
    return {
      id: this._id.toString(),
      saleId: this._saleId.toString(),
      customerPaymentId: this._customerPaymentId.toString(),
      organizationId: this._organizationId.toString(),
      amount: this._amount,
      createdBy: this._createdBy.toString(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: this._status.value,
    };
  }
}
