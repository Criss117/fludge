import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2Icon,
  ChartColumnStackedIcon,
  HandCoins,
  Home,
  SquareChartGantt,
  Users2Icon,
} from "lucide-react";
import type { BusinessDetail } from "@repo/core/entities/business";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/core/shared/components/ui/sidebar";
import { cn } from "@/core/shared/lib/utils";

interface Props {
  currentBusiness: BusinessDetail;
}

const mainItems = [
  {
    title: "Inicio",
    icon: Home,
    href: "/business/$id",
  },
  {
    title: "Clientes",
    icon: Users2Icon,
    href: "/business/$id/clients",
  },
  {
    title: "Productos",
    icon: SquareChartGantt,
    href: "/business/$id/products",
  },
  {
    title: "Categorias",
    icon: ChartColumnStackedIcon,
    href: "/business/$id/categories",
  },
  {
    title: "Proveedores",
    icon: Building2Icon,
    href: "/business/$id/providers",
  },
  {
    title: "Ventas",
    icon: HandCoins,
    href: "/business/$id/sales",
  },
] as const;

export function NavMain({ currentBusiness }: Props) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {mainItems.map((item) => (
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
