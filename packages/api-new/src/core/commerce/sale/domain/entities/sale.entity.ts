import { UUID } from "@fludge/utils/uuid";
import { SaleCancellation } from "../value-objects/sale-cancellation";
import type {
  SaleItemSelect,
  SalePaymentSelect,
  SaleSelect,
} from "@fludge/db/schema/sales.schema";
import { SaleStatus } from "../value-objects/sale-status";
import { SaleItem, type CreateSaleItem } from "./sale-item.entity";
import { SaleItemCollection } from "./sale-item.collection";
import { DuplicatedSaleItemException } from "../exceptions/duplicated-sale-item.exception";
import { SaleNumber } from "../value-objects/sale-number";
import type { PaymentTypeEnum } from "@fludge/utils/enums/db-enums";
import { PaymentType } from "../value-objects/payment-type";
import { CantChangeSaleStatusException } from "../exceptions/cant-change-sale-status";
import { SaleItemNotFoundException } from "../exceptions/sale-item-not-found.exception";
import { AmountMustBePositiveException } from "@core/commerce/shared/exceptions/amount-must-be-positive.exception";
import { SaleIsCompletedException } from "../exceptions/sale-is-completed.exception";
import { SalePaymentsCollection } from "./sale-payments.collection";
import { SalePayment } from "./sale-payment.entity";
import { SalePaymentNotFoundException } from "../exceptions/sale-payments-not-found";

export interface CreateSale {
  organizationId: UUID;
  createdBy: UUID;
  customerId: UUID | null;
  paymentType: PaymentTypeEnum;
  notes: string | null;
  sequence: number;
  items: Omit<CreateSaleItem, "saleId">[];
}

export class Sale {
  constructor(
    private readonly _id: UUID,
    private readonly _organizationId: UUID,
    private readonly _createdBy: UUID,
    private _customerId: UUID | null,
    private _saleNumber: SaleNumber,
    private _paymentType: PaymentType,
    private _total: number,
    private _totalPaid: number,
    private _notes: string | null,
    private _cancellation: SaleCancellation | null,
    private _status: SaleStatus,
    private _completedAt: Date | null,
    private _updatedAt: Date,
    private readonly _createdAt: Date,

    private _items: SaleItemCollection,
    private _payments: SalePaymentsCollection,
  ) {}

  public static create(data: CreateSale): Sale {
    const now = new Date();
    const saleId = UUID.generate();

    const collection = new SaleItemCollection(
      data.items.map((d) =>
        SaleItem.create({
          ...d,
          saleId,
        }),
      ),
    );

    if (collection.hasDuplicatedPresentations())
      throw new DuplicatedSaleItemException();

    const total = collection.calculateTotal();

    return new Sale(
      saleId,
      data.organizationId,
      data.createdBy,
      data.customerId,
      SaleNumber.create(data.sequence),
      new PaymentType(data.paymentType),
      total,
      data.paymentType === "credit" ? 0 : total,
      data.notes,
      null,
      new SaleStatus(data.paymentType === "credit" ? "open" : "completed"),
      null,
      now,
      now,
      collection,
      new SalePaymentsCollection(),
    );
  }

  public static reconstitute(
    data: SaleSelect & {
      items: SaleItemSelect[];
      payments: SalePaymentSelect[];
    },
  ): Sale {
    const cancellation =
      data.status === "cancelled" && data.cancelReason && data.cancelledAt
        ? new SaleCancellation(data.cancelReason, data.cancelledAt)
        : null;

    return new Sale(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      UUID.fromString(data.createdBy),
      data.customerId ? UUID.fromString(data.customerId) : null,
      SaleNumber.fromString(data.saleNumber),
      new PaymentType(data.paymentType),
      data.total,
      data.totalPaid,
      data.notes,
      cancellation,
      new SaleStatus(data.status),
      data.completedAt ? new Date(data.completedAt) : null,
      new Date(data.updatedAt),
      new Date(data.createdAt),

      new SaleItemCollection(data.items.map((d) => SaleItem.reconstitute(d))),
      new SalePaymentsCollection(
        data.payments.map((d) => SalePayment.reconstitute(d)),
      ),
    );
  }

  public touch() {
    this._updatedAt = new Date();
  }

  public refundItems(itemIds: string[]) {
    const itemsToRefund: SaleItem[] = [];

    for (const id of itemIds) {
      const existing = this._items.findById(id);

      if (!existing) throw new SaleItemNotFoundException();

      if (existing.status.isInactive()) continue;

      existing.update({ status: "inactive" });
      itemsToRefund.push(existing);
    }

    this._total = this._items.calculateTotal();

    this.touch();

    return itemsToRefund;
  }

  public cancel(reason?: string) {
    if (!this.status.canTransitionTo("cancelled"))
      throw new CantChangeSaleStatusException();

    this._status = this._status.transitionTo("cancelled");
    this._cancellation = new SaleCancellation(reason ?? "", new Date());

    for (const item of this._items.values) {
      item.update({
        status: "inactive",
      });

      this._items.update(item);
    }

    this.touch();
  }

  public complete() {
    if (!this.status.canTransitionTo("completed"))
      throw new CantChangeSaleStatusException();

    this._status = this._status.transitionTo("completed");
    this.touch();
  }

  public pay(customerPaymentId: UUID, amount: number, createdBy: UUID) {
    if (amount < 0) throw new AmountMustBePositiveException();

    if (this.status.isCompleted()) throw new SaleIsCompletedException();

    const remaining = this.remaining;

    if (amount > remaining) throw new AmountMustBePositiveException();

    this._totalPaid += amount;

    if (this._totalPaid === this._total) {
      this.complete();
    }

    const newSalePayment = SalePayment.create({
      customerPaymentId,
      amount,
      createdBy,
      organizationId: this._organizationId,
      saleId: this._id,
    });

    this._payments.add(newSalePayment);

    this.touch();

    return newSalePayment;
  }

  public revertPayment(customerPaymentId: UUID[]) {
    const paymentsToRevert =
      this._payments.findByCustomerPaymentId(customerPaymentId);

    if (paymentsToRevert.length === 0) throw new SalePaymentNotFoundException();

    const amount = paymentsToRevert.reduce(
      (acc, payment) => acc + payment.amount,
      0,
    );

    this._totalPaid -= amount;

    if (this._status.isCompleted() && this._totalPaid < this._total) {
      this._status = new SaleStatus("open");
      this._completedAt = null;
    }

    this.touch();
  }

  public get total() {
    return this._total;
  }

  public get totalPaid() {
    return this._totalPaid;
  }

  public get remaining() {
    return this._total - this._totalPaid;
  }

  public get status() {
    return this._status;
  }

  public get id(): UUID {
    return this._id;
  }

  public get items() {
    return this._items;
  }

  public get values(): SaleSelect & {
    items: SaleItemSelect[];
    payments: SalePaymentSelect[];
  } {
    const cancellation = this._cancellation?.value;

    return {
      id: this._id.toString(),
      organizationId: this._organizationId.toString(),
      createdBy: this._createdBy.toString(),
      customerId: this._customerId?.toString() ?? null,
      saleNumber: this._saleNumber.value,
      paymentType: this._paymentType.value,
      total: this._total,
      totalPaid: this._totalPaid,
      notes: this._notes,
      status: this._status.value as "cancelled" | "completed" | "open",
      cancelReason: cancellation?.reason ?? null,
      cancelledAt: cancellation?.cancelledAt ?? null,
      completedAt: this._completedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,

      items: this._items.values.map((item) => item.values),

      payments: this._payments.all.map((p) => p.values),
    };
  }
}
