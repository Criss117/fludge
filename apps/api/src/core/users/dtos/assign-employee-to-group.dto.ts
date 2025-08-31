import { IsUUID } from 'class-validator';

export class AssignEmployeeToGroupDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  groupId: string;
}
