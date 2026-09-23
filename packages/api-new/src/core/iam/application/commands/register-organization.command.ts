import type { z } from "zod";
import { Group } from "@core/iam/domain/entities/group.entity";
import { Member } from "@core/iam/domain/entities/member.entity";
import { Organization } from "@core/iam/domain/entities/organization.entity";
import { OrganizationAlreadyExistsException } from "@core/iam/domain/exceptions/organization-already-exists.exception";
import type { GroupRepository } from "@core/iam/domain/repositories/group.repository";
import type { MemberRepository } from "@core/iam/domain/repositories/member.repository";
import type { OrganizationRepository } from "@core/iam/domain/repositories/organization.repository";
import { InternalServerError } from "@core/shared/exceptions/base-exception";
import { PERMISSIONS } from "@fludge/utils/permissions/data";
import { Permissions } from "@fludge/utils/permissions/index";
import { registerOrganizationValidator } from "@fludge/utils/validators/organization.validators";
import { UUID } from "@fludge/utils/uuid";
import type { OrganizationUniquenessValidator } from "@core/iam/application/services/organization-uniqueness-validator.service";

export const registerOrganizationCommand = registerOrganizationValidator;

type CMD = z.infer<typeof registerOrganizationCommand>;

export class RegisterOrganizationCommand {
  constructor(
    private readonly organizationUniquenessValidator: OrganizationUniquenessValidator,
    private readonly organizationRepository: OrganizationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  public async execute(rootUserId: string, cmd: CMD) {
    const organization = Organization.create({
      legalName: cmd.legalName,
      name: cmd.name,
      phone: cmd.phone,
      taxId: cmd.taxId,
      address: cmd.address,
    });

    const ownerMember = Member.create({
      userId: UUID.fromString(rootUserId),
      organizationId: organization.id,
      role: "owner",
      assignedBy: null,
    });

    const adminGroup = Group.create({
      name: "Administradores",
      description: "Grupo de administradores",
      permissions: Permissions.fromRecord(PERMISSIONS),
      createdBy: ownerMember.id,
      organizationId: organization.id,
    });

    const [uniqueness, errUniqueness] =
      await this.organizationUniquenessValidator.validateUniqueFields({
        legalName: organization.values.legalName,
        name: organization.values.name,
        phone: organization.values.phone,
        taxId: organization.values.taxId,
        slug: organization.values.slug,
      });

    if (errUniqueness)
      throw new InternalServerError(
        errUniqueness,
        "api_errors.iam.organizations.isr_on_find",
      );

    if (uniqueness.nameTaken || uniqueness.slugTaken)
      throw new OrganizationAlreadyExistsException(
        "api_errors.iam.organizations.name_taken",
      );

    if (uniqueness.legalNameTaken)
      throw new OrganizationAlreadyExistsException(
        "api_errors.iam.organizations.legal_name_taken",
      );

    if (uniqueness.taxIdTaken)
      throw new OrganizationAlreadyExistsException(
        "api_errors.iam.organizations.tax_id_taken",
      );

    if (uniqueness.phoneTaken)
      throw new OrganizationAlreadyExistsException(
        "api_errors.iam.organizations.phone_taken",
      );

    const [, errSaving] = await this.organizationRepository.transaction(
      async (tx) => {
        const [, errInsertOrganization] =
          await this.organizationRepository.insert(organization, { tx });

        if (errInsertOrganization) throw errInsertOrganization;

        const [, errInsertMember] = await this.memberRepository.insert(
          ownerMember,
          { tx },
        );

        if (errInsertMember) throw errInsertMember;

        const [, errInsertGroup] = await this.groupRepository.insert(
          adminGroup,
          {
            tx,
          },
        );

        if (errInsertGroup) throw errInsertGroup;
      },
    );

    if (errSaving)
      throw new InternalServerError(
        errSaving,
        "api_errors.iam.organizations.isr_on_save",
      );

    return organization.values;
  }
}
