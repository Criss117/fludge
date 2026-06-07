import type { DomainEvent } from "./event-bus";

export class OrganizationRegisteredEvent implements DomainEvent {
  readonly eventName = "organization:registered";
  readonly occurredAt = new Date();
  readonly createdBy: {
    memberId: string;
    name: string;
    email: string;
  } | null;

  constructor(
    public readonly organizationId: string,
    createdBy: {
      memberId: string;
      name: string;
      email: string;
    } | null,
  ) {
    this.createdBy = createdBy;
  }
}
