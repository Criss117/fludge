import { useTotalMembers } from "@fludge/client/application/iam/hooks/use-find-members";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { RegisterMember } from "../components/register-member";

interface Props {
  organizationId: string;
}

export function MembersHeaderSection({ organizationId }: Props) {
  const { data: totaMembers } = useTotalMembers(organizationId);

  const membersInfo = [
    {
      title: "Miembros Totales",
      data: totaMembers,
    },
  ];

  return (
    <section className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold">Miembros</h2>
          <p className="text-muted-foreground">
            Gestionar el acceso de los miembros. Los permisos se heredan a
            través de la pertenencia a grupos.
          </p>
        </div>

        <div>
          <RegisterMember organizationId={organizationId} />
        </div>
      </header>

      <div className="grid grid-cols-4 gap-x-4 justify-between">
        {membersInfo.map(({ title, data }) => (
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
