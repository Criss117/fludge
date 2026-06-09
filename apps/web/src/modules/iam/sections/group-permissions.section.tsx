import { GroupDetail } from "@fludge/client/application/iam/hooks/use-find-groups";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fludge/ui/components/accordion";
import { Badge } from "@fludge/ui/components/badge";
import {
  PERMISSIONS,
  RESOURCE_DESCRIPTIONS,
  type Resource,
} from "@fludge/utils/permissions/data";
import {
  getPermissionByResource,
  getPermissionDescription,
} from "@fludge/utils/permissions/index";

interface Props {
  group: GroupDetail;
}

export function GroupPermissionsSection({ group }: Props) {
  if (group.permissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">
          Este grupo no tiene permisos asignados
        </p>
      </div>
    );
  }

  const resources = Object.keys(PERMISSIONS) as Resource[];

  return (
    <Accordion multiple defaultValue={[resources[0]]}>
      {resources.map((resource) => {
        const resourcePermissions = getPermissionByResource(resource);
        const groupPermissionsForResource = group.permissions.filter((p) =>
          resourcePermissions.includes(p),
        );
        const count = groupPermissionsForResource.length;

        return (
          <AccordionItem key={resource} value={resource}>
            <AccordionTrigger>
              <div className="flex items-center gap-x-2">
                <span>{RESOURCE_DESCRIPTIONS[resource]}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {count === 0 ? (
                <p className="text-muted-foreground">Sin permisos</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {groupPermissionsForResource.map((permission) => {
                    const { title, description } =
                      getPermissionDescription(permission);
                    return (
                      <div key={permission} className="flex items-center gap-x-2">
                        <Badge variant="outline">{title}</Badge>
                        <span className="text-muted-foreground text-sm">
                          {description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
