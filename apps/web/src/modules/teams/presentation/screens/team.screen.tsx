import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shared/components/ui/tabs";
import { FiltersProvider } from "@shared/store/teams-filters.store";

import {
  TeamHeaderSection,
  TeamHeaderSkeleton,
} from "@teams/presentation/sections/team-header.section";
import type { TeamWithMembers } from "@teams/application/hooks/use-teams-queries";
import { PermissionsSection } from "@teams/presentation/sections/permissions.section";
import { TeamEmployeesSection } from "@teams/presentation/sections/team-employees.section";

interface Props {
  team: TeamWithMembers;
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
          <FiltersProvider>
            <TeamEmployeesSection team={team} />
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
