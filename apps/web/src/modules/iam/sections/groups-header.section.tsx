import { Button } from "@fludge/ui/components/button";
import { PlusIcon } from "lucide-react";
import { useTotalGroups } from "@fludge/client/application/iam/hooks/use-find-groups";
import { useFindTotalMembers } from "@fludge/client/application/iam/hooks/use-find-members";
import { useFindTotalGroupMembers } from "@fludge/client/application/iam/hooks/use-find-group-members";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@fludge/ui/components/card";

interface Props {
  organizationId: string;
}

export function GroupsHeaderSection({ organizationId }: Props) {
  const { data: totalGroups } = useTotalGroups(organizationId);
  const { data: totalGroupMembers } = useFindTotalGroupMembers(organizationId);
  const { data: totalMembers } = useFindTotalMembers(organizationId);

  const groupInfo = [
    {
      title: "Grupos Totales",
      data: totalGroups,
    },
    {
      title: "Miembros Asignados",
      data: totalGroupMembers,
    },
    {
      title: "Miembros Sin Asignar",
      data: totalMembers - totalGroupMembers,
    },
  ];

  return (
    <section className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Listado de Grupos</h2>
          <p className="text-muted-foreground">
            Controla el nivel de acceso de los miembros a través de la
            organización
          </p>
        </div>
        <div>
          <Button>
            <PlusIcon />
            <span>Nuevo Grupo</span>
          </Button>
        </div>
      </header>
      <div className="flex gap-x-4 justify-between">
        {groupInfo.map(({ title, data }) => (
          <Card key={title} className="flex-1">
            <CardHeader>
              <CardTitle className="uppercase text-muted-foreground">
                {title}
              </CardTitle>
              <CardDescription className="text-2xl">{data}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function GroupsHeaderSectionSkeleton() {
  return null;
}
