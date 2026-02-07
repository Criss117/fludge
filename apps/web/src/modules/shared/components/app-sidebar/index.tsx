import type { LinkProps } from "@tanstack/react-router";
import type { LucideProps } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarSeparator,
} from "../ui/sidebar";
import { NavSystem } from "./nav-system";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { AppSideBarHeader } from "./header";

type NAVITEM = {
  title: string;
  url: LinkProps["to"];
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
};

export function AppSidebar({ orgSlug }: { orgSlug: string }) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <AppSideBarHeader orgSlug={orgSlug} />
      <SidebarContent>
        <NavMain orgSlug={orgSlug} />
        <SidebarSeparator className="my-2" />
        <NavSystem />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
