import { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import { Avatar, AvatarFallback } from "@fludge/ui/components/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fludge/ui/components/table";

interface Props {
  group: GroupDetail;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function GroupMembersSection({ group }: Props) {
  if (group.members.size === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          Este grupo no tiene miembros asignados
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Asignado por</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {group.members.toArray.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center gap-x-2">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                {member.name}
              </div>
            </TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>
              {member.assignedBy
                ? typeof member.assignedBy === "string"
                  ? member.assignedBy
                  : member.assignedBy.name || "—"
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
