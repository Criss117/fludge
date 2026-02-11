import { TeamHeaderSection } from "../sections/team-header.section";
import type { Team } from "../../application/collections/teams.collection";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/components/ui/tabs";
import { PermissionsSection } from "../sections/permissions.section";

interface Props {
  team: Team;
}

export function TeamScreen({ team }: Props) {
  return (
    <div className="px-5 mt-4 space-y-8">
      <TeamHeaderSection team={team} />
      <Tabs defaultValue="employees" className="space-y-3">
        <TabsList variant="line" className="w-1/2">
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="permissions">Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsSection permissions={team.permissions} teamId={team.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
