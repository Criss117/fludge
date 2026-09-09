// entities/sale.entity.ts
import { UUID } from "@fludge/utils/uuid";
import { SaleCancellation } from "../value-objects/sale-cancellation";
import type {
  SaleItemSelect,
  SaleSelect,
} from "@fludge/db/schema/sales.schema";
import { SaleStatus } from "../value-objects/sale-status";
import { SaleItem, type CreateSaleItem } from "./sale-item.entity";
import { SaleItemCollection } from "./sale-item-collection";
import { DuplicatedSaleItemException } from "../exceptions/duplicated-sale-item.exception";
import { SaleNumber } from "../value-objects/sale-number";
import type { PaymentTypeEnum } from "@fludge/utils/enums/db-enums";
import { PaymentType } from "../value-objects/payment-type";

interface CreateSale {
  organizationId: UUID;
  createdBy: UUID;
  customerId: UUID | null;
  paymentType: PaymentTypeEnum;
  notes: string | null;
  sequence: number;
  items: CreateSaleItem[];
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
    private _notes: string | null,
    private _cancellation: SaleCancellation | null,
    private _status: SaleStatus,
    private _completedAt: Date | null,
    private _updatedAt: Date,
    private readonly _createdAt: Date,

    private _items: SaleItemCollection,
  ) {}

  public static create(data: CreateSale): Sale {
    const now = new Date();

    const collection = new SaleItemCollection(
      data.items.map((d) => SaleItem.create(d)),
    );

    if (collection.hasDuplicatedPresentations())
      throw new DuplicatedSaleItemException();

    const total = collection.calculateTotal();

    return new Sale(
      UUID.generate(),
      data.organizationId,
      data.createdBy,
      data.customerId,
      SaleNumber.create(data.sequence),
      new PaymentType(data.paymentType),
      total,
      data.notes,
      null,
      new SaleStatus("open"),
      null,
      now,
      now,
      collection,
    );
  }

  public static reconstitute(
    data: SaleSelect & {
      items: SaleItemSelect[];
    },
  ): Sale {
    const cancellation =
      data.status === "cancelled" || data.cancelReason || data.cancelledAt
        ? new SaleCancellation(
            data.cancelReason,
            data.cancelledAt ? new Date(data.cancelledAt) : null,
          )
        : null;

    return new Sale(
      UUID.fromString(data.id),
      UUID.fromString(data.organizationId),
      UUID.fromString(data.createdBy),
      data.customerId ? UUID.fromString(data.customerId) : null,
      SaleNumber.fromString(data.saleNumber),
      new PaymentType(data.paymentType),
      data.total,
      data.notes,
      cancellation,
      new SaleStatus(data.status),
      data.completedAt ? new Date(data.completedAt) : null,
      new Date(data.updatedAt),
      new Date(data.createdAt),

      new SaleItemCollection(data.items.map((d) => SaleItem.reconstitute(d))),
    );
  }

  public get values(): SaleSelect & {
    items: Omit<SaleItemSelect, "saleId">[];
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
      notes: this._notes,
      status: this._status.value as "cancelled" | "completed" | "open",
      cancelReason: cancellation?.reason ?? null,
      cancelledAt: cancellation?.cancelledAt ?? null,
      completedAt: this._completedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,

      items: this._items.values.map((item) => item.values),
    };
  }
}
