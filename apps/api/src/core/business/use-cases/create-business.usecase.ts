import { Injectable } from '@nestjs/common';
import { BusinessCommandsRepository } from '../repositories/business-commands.repository';
import { BusinessQueriesRepository } from '../repositories/business-queries.repository';
import { CreateBusinessDto } from '../dtos/create-business.dto';
import { BusinessAlreadyExistsException } from '../exeptions/business-already-exists.exeption';
import { allPermissions } from '@repo/core/value-objects/permission';

@Injectable()
export class CreateBusinessUseCase {
  constructor(
    private readonly businessCommandsRepository: BusinessCommandsRepository,
    private readonly businessQueriesRepository: BusinessQueriesRepository,
  ) {}

  public async execute(data: CreateBusinessDto, rootUserId: string) {
    const existingBusiness = await this.businessQueriesRepository.findManyBy(
      {
        name: data.name,
        nit: data.nit,
      },
      {
        ensureActive: true,
      },
    );

    if (existingBusiness.length) {
      throw new BusinessAlreadyExistsException();
    }

    return this.businessCommandsRepository.save({
      ...data,
      rootUserId,
      groups: [
        {
          name: 'Administradores',
          permissions: allPermissions,
          description: 'Grupo de usuarios administradores',
        },
      ],
    });
  }
}
