import { Injectable } from '@nestjs/common';
import { ProductsQueriesRepository } from '../repositories/products-queries.repository';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductNotFoundException } from '../exceptions/product-not-found.exception';
import { BarcodeIsAlreadyInUseException } from '../exceptions/barcode-is-already-in-use.exception';
import { ProductsCommnadsRepository } from '../repositories/products-commands.repository';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productsQueriesRepository: ProductsQueriesRepository,
    private readonly productsCommnadsRepository: ProductsCommnadsRepository,
  ) {}

  public async execute(
    businessId: string,
    productId: string,
    data: UpdateProductDto,
  ) {
    const existingProduct = await this.productsQueriesRepository.findOneBy(
      {
        productId,
        businessId,
      },
      { ensureActive: true },
    );

    if (!existingProduct) {
      throw new ProductNotFoundException();
    }

    if (existingProduct.barcode !== data.barcode) {
      const existingBarcodeProduct =
        await this.productsQueriesRepository.findOneBy(
          {
            barcode: data.barcode,
            businessId,
          },
          { ensureActive: true },
        );

      if (existingBarcodeProduct) {
        throw new BarcodeIsAlreadyInUseException();
      }
    }

    const productToSave = {
      ...existingProduct,
      ...data,
    };

    await this.productsCommnadsRepository.save({
      ...productToSave,
      id: productId,
      businessId,
    });
  }
}
