export function filterAssignableMembers<T extends { role: string }>(
  members: T[],
) {
  return members.filter((member) => member.role !== "owner");
}

export function toggleSelection(selectedIds: string[], id: string) {
  return selectedIds.includes(id)
    ? selectedIds.filter((selectedId) => selectedId !== id)
    : [...selectedIds, id];
}

export function assignmentLabel(count: number) {
  return `Asignar ${count} ${count === 1 ? "Miembro" : "Miembros"}`;
}
