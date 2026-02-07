import { Link } from "@tanstack/react-router";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Logo } from "../logo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/integrations/orpc";

interface Props {
  orgSlug: string;
}

export function AppSideBarHeader({ orgSlug }: Props) {
  const { data } = useSuspenseQuery(orpc.auth.getSession.queryOptions());

  if (!data) return null;

  const organizations = data.organizations;
  const activeOrganizationId = organizations.find(
    (org) => org.id === data.session.activeOrganizationId,
  )?.id;

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center">
          <SidebarMenuButton
            className="[&_svg]:size-8"
            render={(props) => (
              <Link
                to="/dashboard/$orgslug"
                params={{ orgslug: orgSlug }}
                {...props}
              />
            )}
          >
            <Logo />
            <span className="text-base font-semibold">Fludge</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
