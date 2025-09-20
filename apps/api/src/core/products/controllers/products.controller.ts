import { Permissions } from '@core/auth/decorators/permissions.decorator';
import { Controller, Param, Post } from '@nestjs/common';

@Controller('business/:id/products')
export class ProductsController {}
