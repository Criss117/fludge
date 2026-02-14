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
import { Check, ChevronDown, Building2, PlusCircleIcon } from "lucide-react";
import { cn } from "@/modules/shared/lib/utils";
import { useVerifiedSession } from "@/integrations/auth/context";

interface Props {
  orgSlug: string;
}

export function AppSideBarHeader({ orgSlug }: Props) {
  const session = useVerifiedSession();

  const organizations = session.organizations;
  const activeOrganization = organizations.find(
    (org) => org.id === session.activeOrganizationId,
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
                      render={(props) => (
                        <Link
                          to="/dashboard/$orgslug"
                          preload={false}
                          params={{ orgslug: org.slug }}
                          {...props}
                        />
                      )}
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
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  nativeButton={false}
                  className="cursor-pointer flex items-center"
                  render={(props) => (
                    <Link {...props} to="/register-organization" />
                  )}
                >
                  <PlusCircleIcon />
                  <span>Registrar Organización</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
