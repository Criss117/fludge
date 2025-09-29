import { Link, type LinkOptions } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

interface PageHeaderProps {
  children: React.ReactNode;
}

interface CommonProps {
  businessId?: string;
  isPage?: boolean;
}

interface Product extends CommonProps {
  productId: string;
  productName: string;
}

interface Category extends CommonProps {
  categoryId: string;
  categoryName: string;
}

interface Group extends CommonProps {
  groupId: string;
  groupName: string;
}

interface Employee extends CommonProps {
  employeeId: string;
  employeeName: string;
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="h-10 py-2 flex items-center space-x-2 border-b">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-full" />
      <Breadcrumb>
        <BreadcrumbList>{children}</BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

function BreadcrumbTemplate({
  businessId,
  isPage,
  to,
  params,
  label,
}: {
  isPage?: boolean;
  businessId?: string;
  label: string;
  to: LinkOptions["to"];
  params?: LinkOptions["params"];
}) {
  return (
    <>
      <BreadcrumbItem>
        {!isPage && businessId && (
          <BreadcrumbLink asChild>
            <Link to={to} params={params} className="text-xl font-semibold">
              {label}
            </Link>
          </BreadcrumbLink>
        )}
        {isPage && (
          <BreadcrumbPage className="text-xl font-semibold">
            {label}
          </BreadcrumbPage>
        )}
      </BreadcrumbItem>
      {!isPage && <BreadcrumbSeparator />}
    </>
  );
}

export function PageHeaderHome({ businessId, isPage = false }: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Inicio"
      to="/business/$id"
      params={{
        id: businessId,
      }}
    />
  );
}

export function PageHeaderProducts({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Productos"
      to="/business/$id/products"
      params={{ id: businessId }}
    />
  );
}

export function PageHeaderProduct({
  businessId,
  isPage = false,
  productId,
  productName,
}: Product) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label={productName}
      to="/business/$id/products/$productid"
      params={{ id: businessId, productid: productId }}
    />
  );
}

export function PageHeaderCreateProduct({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Nuevo Producto"
      to="/business/$id/products/create"
      params={{ id: businessId }}
    />
  );
}

export function PageHeaderUpdateProduct({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Editar Producto"
      to="/business/$id/products/create"
      params={{ id: businessId }}
    />
  );
}

export function PageHeaderCategories({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Categorias"
      to="/business/$id/categories"
      params={{ id: businessId }}
    />
  );
}

export function PageHeaderCategory({
  businessId,
  isPage = false,
  categoryId,
  categoryName,
}: Category) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label={categoryName}
      to="/business/$id/categories/$categoryid"
      params={{ id: businessId, categoryid: categoryId }}
    />
  );
}

export function PageHeaderGroups({ businessId, isPage = false }: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Grupos"
      to="/business/$id/groups"
      params={{ id: businessId }}
    />
  );
}

export function PageHeaderGroup({
  businessId,
  isPage = false,
  groupId,
  groupName,
}: Group) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label={groupName}
      to="/business/$id/groups/$groupid"
      params={{ id: businessId, groupid: groupId }}
    />
  );
}

export function PageHeaderCreateGroup({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Crear Grupo"
      to="/business/$id/groups/create"
      params={{ id: businessId }}
    />
  );
}

export function PageHeaderEmployees({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label="Empleados"
      to="/business/$id/employees"
      params={{ id: businessId }}
    />
  );
}

export function PageHeaderEmployee({
  businessId,
  isPage = false,
  employeeId,
  employeeName,
}: Employee) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      label={employeeName}
      to="/business/$id/employees/$employeeid"
      params={{ id: businessId, employeeid: employeeId }}
    />
  );
}

export function PageHeaderCreateEmployee({
  businessId,
  isPage = false,
}: CommonProps) {
  return (
    <BreadcrumbTemplate
      businessId={businessId}
      isPage={isPage}
      to="/business/$id/employees/create"
      params={{
        id: businessId,
      }}
      label="Crear Empleado"
    />
  );
}
