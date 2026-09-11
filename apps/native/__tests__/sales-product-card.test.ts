import { getSalesProductPrice } from "@/modules/sales/presentation/components/sales-product-card";

describe("getSalesProductPrice", () => {
  it("returns the fallback for products without presentations", () => {
    expect(getSalesProductPrice([], "Sin precio")).toBe("Sin precio");
  });

  it("formats one price when all presentations share it", () => {
    expect(getSalesProductPrice([{ priceSale: 15 }], "Sin precio")).toBe(
      "$15.00"
    );
  });

  it("formats the minimum and maximum prices for a range", () => {
    expect(
      getSalesProductPrice(
        [{ priceSale: 30 }, { priceSale: 15 }, { priceSale: 22 }],
        "Sin precio"
      )
    ).toBe("$15.00 - $30.00");
  });
});
