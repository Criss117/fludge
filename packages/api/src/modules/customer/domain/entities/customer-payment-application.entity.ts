import { UUID } from "@fludge/utils/uuid";
import type { CustomerPaymentApplicationSelect } from "@fludge/db/schema/customer-payment-application.schema";

interface CreateCustomerPaymentApplication {
  paymentId: UUID;
  saleId: UUID;
  amount: number;
}

export class CustomerPaymentApplication {
  constructor(
    private readonly _paymentId: UUID,
    private readonly _saleId: UUID,
    private readonly _amount: number,
    private readonly _createdAt: Date,
  ) {}

  public static create(data: CreateCustomerPaymentApplication) {
    return new CustomerPaymentApplication(
      data.paymentId,
      data.saleId,
      data.amount,
      new Date(),
    );
  }

  public static reconstitute(
    data: CustomerPaymentApplicationSelect,
  ): CustomerPaymentApplication {
    return new CustomerPaymentApplication(
      UUID.fromString(data.paymentId),
      UUID.fromString(data.saleId),
      data.amount,
      new Date(data.createdAt),
    );
  }

  public get paymentId() {
    return this._paymentId;
  }

  public get saleId() {
    return this._saleId;
  }

  public get amount() {
    return this._amount;
  }

  public get createdAt() {
    return this._createdAt;
  }

  public get values(): CustomerPaymentApplicationSelect {
    return {
      paymentId: this._paymentId.toString(),
      saleId: this._saleId.toString(),
      amount: this._amount,
      createdAt: this._createdAt,
    };
  }
}