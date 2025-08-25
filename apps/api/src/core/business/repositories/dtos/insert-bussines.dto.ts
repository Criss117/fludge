import { InsertBusiness, InsertGroup } from '@repo/db';

export interface InsertBusinessDto extends InsertBusiness {
  groups?: Omit<InsertGroup, 'businessId'>[];
}
