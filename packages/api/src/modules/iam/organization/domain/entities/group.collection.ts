import type { UUID } from "@fludge/utils/uuid";
import { GroupAlreadyExistsException } from "../exceptions/group-already-exists.exception";
import { Group, type CreateGroup, type UpdateGroup } from "./group.entity";
import { GroupNotFoundException } from "../exceptions/group-not-found.exception";
import type { GroupSelect } from "@fludge/db/schema/iam.schema";

export class GroupCollection {
  private constructor(private _groups: Map<string, Group>) {}

  public static create(values?: CreateGroup[]): GroupCollection {
    const groups = values?.map((g) => Group.create(g)) ?? [];

    return new GroupCollection(
      new Map(groups.map((g) => [g.id.toString(), g])),
    );
  }

  public static reconstitute(values: GroupSelect[]) {
    return new GroupCollection(
      new Map(values.map((g) => [g.id, Group.reconstitute(g)])),
    );
  }

  public addGroup(group: Group) {
    if (this._groups.has(group.id.toString()))
      throw new GroupAlreadyExistsException();

    const nameIsAvailable = this.groupNameIsAvailable(group.values.name);

    if (!nameIsAvailable)
      throw new GroupAlreadyExistsException("El nombre ya está en uso");

    this._groups.set(group.id.toString(), group);
  }

  public getGroup(groupId: UUID) {
    const group = this._groups.get(groupId.toString());

    return group ? group : null;
  }

  public groupNameIsAvailable(name: string, excludeId?: UUID) {
    let available = true;

    for (const group of this._groups.values()) {
      const nameIsTaken = group.nameIsTaken(name);
      const excludeThisGroup = excludeId && excludeId.equals(group.id);

      if (nameIsTaken && !excludeThisGroup) {
        available = false;
        break;
      }
    }

    return available;
  }

  public updateGroup(
    groupId: UUID,
    values: UpdateGroup & { toogleActive?: boolean },
  ) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    if (values.toogleActive) {
      if (group.status.isActive()) group.setInactive();
      else group.setActive();
    }

    if (
      values.name &&
      values.name !== group.values.name &&
      !this.groupNameIsAvailable(values.name, group.id)
    )
      throw new GroupAlreadyExistsException("El nombre ya está en uso");

    group.update(values);

    this._groups.set(group.id.toString(), group);
  }

  public disableGroup(groupId: UUID) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    group.setInactive();

    this._groups.set(group.id.toString(), group);
  }

  public enableGroup(groupId: UUID) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    group.setActive();

    this._groups.set(group.id.toString(), group);
  }

  public removeGroup(groupId: UUID) {
    const group = this._groups.get(groupId.toString());

    if (!group) throw new GroupNotFoundException();

    this._groups.delete(groupId.toString());
  }

  public values(organizationId: UUID): GroupSelect[] {
    return Array.from(this._groups.values()).map((group) => ({
      ...group.values,
      organizationId: organizationId.toString(),
    }));
  }
}
