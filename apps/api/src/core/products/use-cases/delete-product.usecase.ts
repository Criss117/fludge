import { Injectable } from '@nestjs/common';
import { ProductsCommnadsRepository } from '../repositories/products-commands.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    private readonly productsCommnadsRepository: ProductsCommnadsRepository,
  ) {}

  public async execute(businessId: string, productId: string) {
    await this.productsCommnadsRepository.delete({
      businessId,
      productId,
    });
  }
}
