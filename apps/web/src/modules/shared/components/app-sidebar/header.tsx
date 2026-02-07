import { Link, useNavigate } from "@tanstack/react-router";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Logo } from "../logo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/integrations/orpc";
import { Check, ChevronDown, Building2 } from "lucide-react";
import { cn } from "@/modules/shared/lib/utils";

interface Props {
  orgSlug: string;
}

export function AppSideBarHeader({ orgSlug }: Props) {
  const { data } = useSuspenseQuery(orpc.auth.getSession.queryOptions());
  const navigate = useNavigate();

  if (!data) return null;

  const organizations = data.organizations;
  const activeOrganization = organizations.find(
    (org) => org.id === data.session.activeOrganizationId,
  );

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

        {organizations.length > 1 && (
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton className="cursor-pointer justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4" />
                      <span className="truncate font-medium">
                        {activeOrganization?.name || "Organización"}
                      </span>
                    </div>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="right" align="start" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Organizaciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {organizations.map((org) => {
                    const isActive = org.id === activeOrganization?.id;

                    return (
                      <DropdownMenuItem
                        key={org.id}
                        className="cursor-pointer flex items-center justify-between"
                        onClick={() =>
                          navigate({
                            to: "/dashboard/$orgslug",
                            params: { orgslug: org.slug },
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="size-4 text-muted-foreground" />
                          <span className="truncate">{org.name}</span>
                        </div>
                        <Check
                          className={cn(
                            "size-4",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarHeader>
  );
}
