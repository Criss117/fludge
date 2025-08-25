import { CreateHealthDto } from './create-health.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateHealthDto extends PartialType(CreateHealthDto) {}
