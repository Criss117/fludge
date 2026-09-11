import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { HeroUINativeProvider } from "heroui-native/provider";
import {
  buildCatalogTicketItem,
  filterProductPresentations,
} from "@/modules/sales/presentation/components/product-presentations-dialog.utils";
import { ProductPresentationsDialog } from "@/modules/sales/presentation/components/product-presentations-dialog";
import { SalesProductCard } from "@/modules/sales/presentation/components/sales-product-card";

const dispatch = jest.fn();
const showErrorToast = jest.fn();

jest.mock("@fludge/client/providers/tickets.provider", () => ({
  useTickets: () => ({ dispatch, selectedTicketId: "Ticket 1" }),
}));

jest.mock("@/modules/shared/hooks/use-mutation-toast", () => ({
  useMutationToast: () => ({ showErrorToast }),
}));

const presentation = {
  id: "presentation-1",
  productId: "product-1",
  name: "Box of 6",
  conversionFactor: 6,
  priceSale: 24,
  priceWholesale: null,
  status: "active",
} as ProductSummary["presentations"][number];

const product = {
  id: "product-1",
  name: "Soda",
  stock: 30,
  minStock: 6,
  allowNegativeStock: false,
  presentations: [presentation],
} as ProductSummary;

describe("buildCatalogTicketItem", () => {
  it("maps presentation and product fields into a quantity-one catalog item", () => {
    expect(buildCatalogTicketItem(product, presentation)).toEqual({
      kind: "catalog",
      quantity: 1,
      presentation: {
        kind: "catalog",
        id: "presentation-1",
        productId: "product-1",
        name: "Box of 6",
        conversionFactor: 6,
        price: 24,
        originalPrice: 24,
        priceWholesale: undefined,
      },
      product: {
        id: "product-1",
        allowNegativeStock: false,
        minStock: 6,
        totalStock: 30,
      },
    });
  });

  it("preserves a wholesale price when the catalog provides one", () => {
    const wholesalePresentation = {
      ...presentation,
      priceWholesale: 20,
    } as ProductSummary["presentations"][number];

    expect(buildCatalogTicketItem(product, wholesalePresentation).presentation)
      .toMatchObject({
        price: 24,
        originalPrice: 24,
        priceWholesale: 20,
      });
  });
});

describe("filterProductPresentations", () => {
  it("shows active and inactive presentations by default", () => {
    const inactive = {
      ...presentation,
      id: "presentation-2",
      status: "inactive",
    } as ProductSummary["presentations"][number];

    expect(filterProductPresentations([presentation, inactive], false)).toEqual([
      presentation,
      inactive,
    ]);
  });

  it("removes presentations whose status is not active when requested", () => {
    const inactive = {
      ...presentation,
      id: "presentation-2",
      status: "inactive",
    } as ProductSummary["presentations"][number];

    expect(filterProductPresentations([presentation, inactive], true)).toEqual([
      presentation,
    ]);
  });
});

describe("ProductPresentationsDialog", () => {
  beforeEach(() => {
    dispatch.mockReset();
    showErrorToast.mockReset();
  });

  it("shows the selected product presentations", () => {
    render(
      <HeroUINativeProvider>
        <ProductPresentationsDialog product={product} onClose={jest.fn()} />
      </HeroUINativeProvider>,
    );

    expect(screen.getByText("Soda")).toBeTruthy();
    expect(screen.getByText("Box of 6")).toBeTruthy();
  });

  it("dispatches a mapped item and closes after selecting a presentation", () => {
    const onClose = jest.fn();

    render(
      <HeroUINativeProvider>
        <ProductPresentationsDialog product={product} onClose={onClose} />
      </HeroUINativeProvider>,
    );

    fireEvent.press(screen.getByText("Box of 6"));

    expect(dispatch).toHaveBeenCalledWith({
      type: "add-item",
      payload: {
        ticketId: "Ticket 1",
        item: buildCatalogTicketItem(product, presentation),
      },
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows an error and stays open when adding fails", () => {
    dispatch.mockImplementation(() => {
      throw new Error("api_errors.catalog.products.insufficient_stock");
    });
    const onClose = jest.fn();

    render(
      <HeroUINativeProvider>
        <ProductPresentationsDialog product={product} onClose={onClose} />
      </HeroUINativeProvider>,
    );

    fireEvent.press(screen.getByText("Box of 6"));

    expect(showErrorToast).toHaveBeenCalledWith(
      "screens.sales.product.presentations.errors.insufficient_stock_label",
      "screens.sales.product.presentations.errors.try_again",
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Box of 6")).toBeTruthy();
  });
});

describe("SalesProductCard", () => {
  it("calls onPress with the product without dispatching a ticket action", () => {
    const onPress = jest.fn();

    render(
      <HeroUINativeProvider>
        <SalesProductCard product={product} onPress={onPress} />
      </HeroUINativeProvider>,
    );

    fireEvent.press(screen.getByText("Soda"));

    expect(onPress).toHaveBeenCalledWith(product);
    expect(dispatch).not.toHaveBeenCalled();
  });
});
