import { memo } from "react";
import { Link, useLocation, type LinkProps } from "@tanstack/react-router";
import {
  Plus,
  LayoutDashboard,
  Briefcase,
  Package,
  UserCog,
  Users,
  type LucideIcon,
  ChevronDown,
  ChevronRight,
  CirclePile,
  ChartBarStacked,
  Container,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../../lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

const DASHBOARD_PATH_REGEX = /\/dashboard\/[^/]+/;

type NavMenuItem = {
  title: string;
  url: NonNullable<LinkProps["to"]>;
  icon: LucideIcon;
  elements?: NavMenuItem[];
};

const navMainItems: NavMenuItem[] = [
  {
    title: "Inicio",
    url: "/dashboard/$orgslug",
    icon: LayoutDashboard,
  },
  {
    title: "Inventario",
    url: "/dashboard/$orgslug/inventory",
    icon: CirclePile,
    elements: [
      {
        title: "Productos",
        url: "/dashboard/$orgslug/inventory/products",
        icon: Package,
      },

      {
        title: "Categorías",
        url: "/dashboard/$orgslug/inventory/categories",
        icon: ChartBarStacked,
      },
      {
        title: "Proveedores",
        url: "/dashboard/$orgslug/inventory/suppliers",
        icon: Container,
      },
    ],
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
];

interface Props {
  orgSlug: string;
}

function SidebarMenuLink({
  item,
  orgSlug,
}: {
  item: NavMenuItem;
  orgSlug: string;
}) {
  const { open } = useSidebar();
  const isMatch = useLocation({
    select: (data) =>
      data.pathname.replace(DASHBOARD_PATH_REGEX, "") ===
      item.url.replace("/dashboard/$orgslug", ""),
  });

  return (
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
  );
}

const GroupItem = memo(function GroupItem({
  orgSlug,
  item,
}: Props & {
  item: NavMenuItem;
}) {
  const isMatch = (url: string) =>
    useLocation({
      select: (data) =>
        data.pathname.replace(DASHBOARD_PATH_REGEX, "") ===
        url.replace("/dashboard/$orgslug", ""),
    });

  return (
    <SidebarMenuItem>
      <SidebarMenuLink item={item} orgSlug={orgSlug} />

      <SidebarMenuSub>
        {item.elements?.map((subItem) => (
          <SidebarMenuSubItem key={subItem.title}>
            <SidebarMenuSubButton
              className={cn(
                "dark:[&>svg]:text-white [&>svg]:text-black",
                isMatch(subItem.url)
                  ? "bg-primary text-black hover:bg-primary hover:text-black [&>svg]:text-black"
                  : "",
              )}
              render={(props) => (
                <Link to={subItem.url} params={{ orgslug: orgSlug }} {...props}>
                  <subItem.icon />
                  <span>{subItem.title}</span>
                </Link>
              )}
            />
          </SidebarMenuSubItem>
        ))}
      </SidebarMenuSub>
    </SidebarMenuItem>
  );
});

export function NavMain({ orgSlug }: Props) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-6">
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
          {navMainItems.map((item) => {
            if (item.elements)
              return (
                <GroupItem key={item.title} orgSlug={orgSlug} item={item} />
              );

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuLink item={item} orgSlug={orgSlug} />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
