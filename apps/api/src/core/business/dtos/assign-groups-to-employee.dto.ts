import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class AssignGroupsToEmployeeDto {
  @IsUUID(4, {
    message: 'Los empleados no son validos',
    each: true,
  })
  @IsArray({
    message: 'Los empleados no son validos',
  })
  @IsNotEmpty({
    message: 'Los empleados no son validos',
  })
  groupIds: string[];
}
