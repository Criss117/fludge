import { UUID } from "@fludge/utils/uuid";
import type { CustomerPaymentMethodEnum } from "@fludge/utils/enums/db-enums";
import { CustomerPaymentAmount } from "../value-objects/customer-payment-amount";
import { CustomerPaymentMethod } from "../value-objects/customer-payment-method";
import type { CustomerPaymentSelect } from "@fludge/db/schema/customer.schema";

interface CreateCustomerPayment {
  organizationId: UUID;
  createdBy: UUID;
  customerId: UUID;
  amount: number;
  method: CustomerPaymentMethodEnum;
  notes: string | null;
}

export class CustomerPayment {
  constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private readonly _createdBy: UUID,
    private readonly _customerId: UUID,
    private _amount: CustomerPaymentAmount,
    private _method: CustomerPaymentMethod,
    private _notes: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  public static create(data: CreateCustomerPayment) {
    const now = new Date();

    return new CustomerPayment(
      UUID.generate(),
      data.organizationId,
      data.createdBy,
      data.customerId,
      new CustomerPaymentAmount(data.amount),
      new CustomerPaymentMethod(data.method),
      data.notes,
      now,
      now,
    );
  }

  public static reconstitute(data: CustomerPaymentSelect): CustomerPayment {
    return new CustomerPayment(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      UUID.fromString(data.createdBy),
      UUID.fromString(data.customerId),
      new CustomerPaymentAmount(data.amount),
      new CustomerPaymentMethod(data.method as CustomerPaymentMethodEnum),
      data.notes ?? null,
      new Date(data.createdAt),
      new Date(data.updatedAt),
    );
  }

  public get id() {
    return this._id;
  }

  public get organizationId() {
    return this._organizationId;
  }

  public get createdBy() {
    return this._createdBy;
  }

  public get customerId() {
    return this._customerId;
  }

  public get amount() {
    return this._amount.value;
  }

  public get method() {
    return this._method.value;
  }

  public get notes() {
    return this._notes;
  }

  public get createdAt() {
    return this._createdAt;
  }

  public get updatedAt() {
    return this._updatedAt;
  }

  public get values(): CustomerPaymentSelect {
    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      createdBy: this._createdBy.toString(),
      customerId: this._customerId.toString(),
      amount: this._amount.value,
      method: this._method.value,
      notes: this._notes,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
