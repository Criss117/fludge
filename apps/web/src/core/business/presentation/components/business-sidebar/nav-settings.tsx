import { GroupIcon, IdCardIcon, Settings } from "lucide-react";
import type { BusinessDetail } from "@repo/core/entities/business";
import { Link, useLocation } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/core/shared/components/ui/sidebar";
import { cn } from "@/core/shared/lib/utils";

interface Props {
  currentBusiness: BusinessDetail;
}

const settingsItems = [
  {
    title: "Grupos",
    icon: GroupIcon,
    href: "/business/$id/groups",
  },
  {
    title: "Empleados",
    icon: IdCardIcon,
    href: "/business/$id/employees",
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/business/$id/settings",
  },
] as const;

export function NavSettings({ currentBusiness }: Props) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Gestión</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {settingsItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                className={cn(
                  item.href.replace("$id", currentBusiness.id) ===
                    location.pathname && "bg-sidebar-accent"
                )}
              >
                <Link to={item.href} params={{ id: currentBusiness.id }}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
