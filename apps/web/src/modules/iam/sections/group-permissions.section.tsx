import { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import {
  PERMISSIONS,
  RESOURCE_DESCRIPTIONS,
  type Resource,
} from "@fludge/utils/permissions/data";
import {
  getPermissionByResource,
  getPermissionDescription,
} from "@fludge/utils/permissions/index";
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

export function GroupPermissionsSection({ group }: Props) {
  const permissions = group.permissions.map((p) => {
    const { description, title, target } = getPermissionDescription(p);

    return { key: p, title, description, target };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Descripción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((p) => (
          <TableRow key={p.key}>
            <TableCell>{p.title}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {p.target}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {p.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
