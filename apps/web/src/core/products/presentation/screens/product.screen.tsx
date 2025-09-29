import {
  PageHeader,
  PageHeaderHome,
  PageHeaderProduct,
  PageHeaderProducts,
} from "@/core/shared/components/page-header-bread-crumb";
import { useFindOneProduct } from "@/core/products/application/hooks/use.find-one-product";
import { ProductHeaderSection } from "../sections/product-header.section";
import {
  ProductDescription,
  ProductPrices,
  ProductImage,
  ProductInventory,
  ProductMetadata,
} from "../components/product-detail";

interface Props {
  businessId: string;
  productId: string;
}

export function ProductScreen({ businessId, productId }: Props) {
  const { data: product } = useFindOneProduct({ businessId, productId });

  return (
    <section className="mx-2 space-y-6 mb-10">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderProducts businessId={businessId} />
        <PageHeaderProduct
          businessId={businessId}
          productId={productId}
          productName={product.name}
          isPage
        />
      </PageHeader>

      <div className="mx-8">
        <ProductHeaderSection product={product} />
      </div>
      <div className="grid grid-cols-4 gap-4 mx-8">
        <div className="col-span-1 row-span-full ">
          <ProductImage product={product} />
        </div>
        <div className="col-span-3 space-y-4">
          <ProductDescription product={product} />
          <ProductPrices product={product} />
          <ProductInventory product={product} />
        </div>
        <div className="col-span-2">
          <ProductMetadata product={product} />
        </div>
        <div className="col-span-2">
          <ProductMetadata product={product} />
        </div>
      </div>
    </section>
  );
}
