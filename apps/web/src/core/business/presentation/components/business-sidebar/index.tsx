import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/core/shared/components/ui/sidebar";
import { BusinessSwitcher } from "./business-switcher";
import type { BusinessDetail } from "@repo/core/entities/business";
import { BusinessSidebarFooter } from "./footer";

interface Props {
  currentBusiness: BusinessDetail;
}

export function BusinessSidebar({ currentBusiness }: Props) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <BusinessSwitcher currentBusiness={currentBusiness} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <BusinessSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
