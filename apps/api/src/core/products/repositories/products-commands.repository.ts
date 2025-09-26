import { Inject, Injectable } from '@nestjs/common';
import { DBSERVICE, type LibSQLDatabase } from '@core/db/db.module';

@Injectable()
export class ProductsCommnadsRepository {
  constructor(@Inject(DBSERVICE) private readonly db: LibSQLDatabase) {}
}
