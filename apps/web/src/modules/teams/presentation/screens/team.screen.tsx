import {
  TeamHeaderSection,
  TeamHeaderSkeleton,
} from "../sections/team-header.section";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/components/ui/tabs";
import { PermissionsSection } from "../sections/permissions.section";
import { TeamEmployeesSection } from "../sections/team-employees.section";
import { FiltersProvider } from "@/modules/shared/store/teams-filters.store";

interface Props {
  team: Team;
  orgSlug: string;
}

export function TeamScreen({ team, orgSlug }: Props) {
  const teamMemberIds = team.employees.map((t) => t.id);

  return (
    <div className="px-5 mt-4 space-y-8">
      <TeamHeaderSection team={team} />
      <Tabs defaultValue="employees" className="space-y-3">
        <TabsList variant="line" className="w-1/2">
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="permissions">Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <FiltersProvider>
            <TeamEmployeesSection teamId={team.id} orgSlug={orgSlug} />
          </FiltersProvider>
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsSection permissions={team.permissions} teamId={team.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function TeamScreenSkeleton() {
  return (
    <div className="px-5 mt-4 space-y-8">
      <TeamHeaderSkeleton />
      <Tabs defaultValue="employees" className="space-y-3">
        <TabsList variant="line" className="w-1/2">
          <TabsTrigger value="employees" disabled>
            Empleados
          </TabsTrigger>
          <TabsTrigger value="permissions" disabled>
            Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          Make changes to your account here.
        </TabsContent>
      </Tabs>
    </div>
  );
}
