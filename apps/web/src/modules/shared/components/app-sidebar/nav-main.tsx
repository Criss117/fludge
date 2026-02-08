import { memo } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Plus,
  LayoutDashboard,
  Briefcase,
  Package,
  UserCog,
  Users,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../../lib/utils";

const DASHBOARD_PATH_REGEX = /\/dashboard\/[^/]+/;

const navMain = [
  {
    title: "Inicio",
    url: "/dashboard/$orgslug",
    icon: LayoutDashboard,
  },
  {
    title: "Productos",
    url: "/dashboard/$orgslug/products",
    icon: Package,
  },
  {
    title: "Clientes",
    url: "/dashboard/$orgslug/clients",
    icon: Users,
  },
  {
    title: "Equipos",
    url: "/dashboard/$orgslug/teams",
    icon: Briefcase,
  },
  {
    title: "Empleados",
    url: "/dashboard/$orgslug/employees",
    icon: UserCog,
  },
] as const;

interface Props {
  orgSlug: string;
}

const NavItem = memo(function NavItem({
  orgSlug,
  item,
}: Props & { item: (typeof navMain)[number] }) {
  const { open } = useSidebar();
  const isMatch = useLocation({
    select: (data) =>
      data.pathname.replace(DASHBOARD_PATH_REGEX, "") ===
      item.url.replace("/dashboard/$orgslug", ""),
  });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          isMatch
            ? "bg-primary text-black hover:bg-primary hover:text-black"
            : "",
        )}
        render={(props) => {
          if (open) {
            return (
              <Link to={item.url} params={{ orgslug: orgSlug }} {...props}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            );
          }

          return (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link to={item.url} params={{ orgslug: orgSlug }} {...props}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                }
              />
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          );
        }}
      />
    </SidebarMenuItem>
  );
});

export function NavMain({ orgSlug }: Props) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 min-w-8 transition-colors"
            >
              <Plus />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {navMain.map((item) => (
            <NavItem key={item.title} orgSlug={orgSlug} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
