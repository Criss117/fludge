import { UUID } from "@fludge/utils/uuid";
import { CustomerDocument } from "../value-objects/document-type";
import { Status } from "@fludge/api/core/shared/value-objects/status";
import { CustomerBalance } from "../value-objects/customer-balance";
import { CustomerPayment } from "./customer-payment.entity";
import { CustomerPaymentCollection } from "./customer-payment.collection";
import { CustomerHasNoDebtException } from "../exceptions/customer-has-no-debt.exception";
import { PaymentExceedsBalanceException } from "../exceptions/payment-exceeds-balance.exception";
import type {
  CustomerPaymentSelect,
  CustomerSelect,
} from "@fludge/db/schema/customer.schema";
import type {
  CustomerDocumentTypeEnum,
  CustomerPaymentMethodEnum,
  StatusEnum,
} from "@fludge/utils/enums/db-enums";

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
    private _payments = new CustomerPaymentCollection(),
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
      new CustomerPaymentCollection(),
    );
  }

  private touch() {
    this._updatedAt = new Date();
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

    this.touch();

    return this;
  }

  public increaseBalance(amount: number) {
    this._balance = this._balance.increaseBalance(amount);
    this.touch();

    return this;
  }

  public decreaseBalance(amount: number) {
    this._balance = this._balance.decreaseBalance(amount);
    this.touch();

    return this;
  }

  public static reconstitute(
    data: CustomerSelect & {
      payments: CustomerPaymentSelect[];
    },
  ) {
    const orderedPayments = data.payments.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

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
      new CustomerPaymentCollection(
        orderedPayments.map((p) => CustomerPayment.reconstitute(p)),
      ),
    );
  }

  public recordPayment(
    amount: number,
    method: CustomerPaymentMethodEnum,
    notes: string | null,
    createdBy: UUID,
  ) {
    if (this._balance.balance === 0) {
      throw new CustomerHasNoDebtException();
    }

    if (amount > this._balance.balance) {
      throw new PaymentExceedsBalanceException();
    }

    const payment = CustomerPayment.create({
      organizationId: this._organizationId,
      createdBy,
      customerId: this._id,
      amount,
      method,
      notes,
    });

    this._balance = this._balance.decreaseBalance(amount);
    this._payments.add(payment);
    this.touch();

    return payment;
  }

  public cancelPayment(paymentId: string) {
    const payment = this._payments.remove(paymentId);

    this._balance = this._balance.increaseBalance(payment.amount);
    this.touch();

    return payment;
  }

  public get payments() {
    return this._payments.collection;
  }

  public get id() {
    return this._id;
  }

  public get values(): CustomerSelect & {
    payments: CustomerPaymentSelect[];
  } {
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
      payments: this._payments.values,
    };
  }
}
