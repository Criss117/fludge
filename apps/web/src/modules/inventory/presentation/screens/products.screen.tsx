import { useState } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import { useProductsCollection } from "@/modules/inventory/application/hooks/use-products-collection";
import { RegisterProduct } from "../components/register-product";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/components/ui/select";

const LIMITS = [
  {
    label: "5",
    value: 5,
  },
  {
    label: "6",
    value: 6,
  },
  {
    label: "7",
    value: 7,
  },
  {
    label: "8",
    value: 8,
  },
];

const PAGES = [
  {
    label: "0",
    value: 0,
  },
  {
    label: "1",
    value: 1,
  },
  {
    label: "2",
    value: 2,
  },
  {
    label: "3",
    value: 3,
  },
  {
    label: "4",
    value: 4,
  },
];

export function ProductsScreen() {
  const [limit, setLimit] = useState(5);
  const [page, setPage] = useState(0);
  const productsCollection = useProductsCollection();
  const { data } = useLiveQuery(
    (q) =>
      q
        .from({ products: productsCollection })
        .limit(limit)
        .offset(page * limit)
        .orderBy(({ products }) => products.createdAt, "asc"),
    [limit, page],
  );

  return (
    <div>
      <RegisterProduct />
      <Select
        items={LIMITS}
        defaultValue={LIMITS[0].value}
        onValueChange={(v) => v && setLimit(v)}
      >
        <SelectTrigger className="w-full max-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Limites</SelectLabel>
            {LIMITS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        items={PAGES}
        defaultValue={PAGES[0].value}
        onValueChange={(v) => v && setPage(v)}
      >
        <SelectTrigger className="w-full max-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Paginas</SelectLabel>
            {PAGES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <p>
        {limit} {page}
      </p>
      <ul className="sapce-y-2">
        {data?.map((product, index) => (
          <li key={product.id} className="flex gap-x-2">
            <p>{index + 1}</p>
            <p>{product.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
