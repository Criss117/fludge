import { ok, type Result } from "@fludge/utils/trycatch";
import { Customer } from "@fludge/api/modules/customer/domain/entities/customer.entity";
import type { Organization } from "@fludge/api/modules/iam/organization/domain/entities/organization.entity";

/**
 * Test double de UpdateCustomerBalanceService.
 * No se testea este service; se inyecta para controlar el resultado
 * del balance del cliente en cancel/refund.
 */
export class FakeUpdateCustomerBalanceService {
  public customer: Customer | null = null;
  public error: Error | null = null;

  public calls: Array<{
    organizationId: string;
    customerId: string;
    amount: number;
  }> = [];

  public async decrease(
    activeOrganization: Organization,
    customerId: string,
    amount: number,
  ): Promise<Result<Customer | null, Error>> {
    this.calls.push({
      organizationId: activeOrganization.id.toString(),
      customerId,
      amount,
    });

    if (this.error) return [null, this.error] as const;

    return ok(this.customer);
  }

  public async increase(
    activeOrganization: Organization,
    customerId: string,
    amount: number,
  ): Promise<Result<Customer | null, Error>> {
    this.calls.push({
      organizationId: activeOrganization.id.toString(),
      customerId,
      amount,
    });

    if (this.error) return [null, this.error] as const;

    return ok(this.customer);
  }
}