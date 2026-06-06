import { Link } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@fludge/ui/components/breadcrumb";
import { Separator } from "@fludge/ui/components/separator";
import { SidebarTrigger } from "@fludge/ui/components/sidebar";

interface PageHeaderProps {
  children: React.ReactNode;
  Action?: React.ReactNode;
}

interface BreadcrumbProps {
  to?: LinkOptions["to"];
  params?: LinkOptions["params"];
  label: string;
}

export function PageHeader({ children, Action }: PageHeaderProps) {
  return (
    <div className="flex w-full justify-between items-center">
      <Breadcrumb className="flex h-full w-full items-center">
        <SidebarTrigger size="icon-lg" />
        <Separator orientation="vertical" />
        <BreadcrumbList className="px-2">{children}</BreadcrumbList>
      </Breadcrumb>
      {Action}
    </div>
  );
}

export function PageHeaderItem({ to, label, params }: BreadcrumbProps) {
  if (!to)
    return (
      <BreadcrumbItem>
        <BreadcrumbPage className="text-xl">{label}</BreadcrumbPage>
      </BreadcrumbItem>
    );

  return (
    <>
      <BreadcrumbItem>
        <BreadcrumbLink
          className="text-xl"
          render={(props) => <Link to={to} params={params} {...props} />}
        >
          {label}
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
    </>
  );
}
