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
} from "../ui/sidebar";
import { Link } from "@tanstack/react-router";

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
    url: "/dashboard/$orgslug",
    icon: Briefcase,
  },
  {
    title: "Empleados",
    url: "/dashboard/$orgslug",
    icon: UserCog,
  },
] as const;

interface Props {
  orgSlug: string;
}

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
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={(props) => (
                  <Link
                    to={item.url}
                    params={{ orgslug: orgSlug }}
                    {...props}
                  />
                )}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
