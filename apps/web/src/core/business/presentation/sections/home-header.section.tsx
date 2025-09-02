import {
  Building2,
  Calendar,
  CheckCircle,
  IdCardIcon,
  MapPin,
  Shield,
  SquareChartGantt,
  Users2Icon,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/core/shared/components/ui/badge";
import { Card, CardContent } from "@/core/shared/components/ui/card";
import type { BusinessDetail } from "@repo/core/entities/business";

interface Props {
  business: BusinessDetail;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  className?: string;
}

function BusinessInfo({ business }: Props) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {business.name}
                </h1>
                {business.isActive && (
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium">NIT:</span>
                  <span className="font-mono">{business.nit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {business.address}, {business.city}, {business.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Creado el{" "}
                    {format(business.createdAt, "do MMMM 'de' yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCard({
  icon: Icon,
  title,
  value,
  className,
  description,
}: StatsCardProps) {
  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HomeHeaderSection({ business }: Props) {
  const { employees } = business;

  const totalProducts = 1407;
  const totalClients = 100;
  const totalSales = 14565;

  return (
    <article className="space-y-6">
      <BusinessInfo business={business} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Productos"
          value={totalProducts}
          description="Productos registrados"
          icon={SquareChartGantt}
        />
        <StatsCard
          title="Total de clientes"
          value={totalClients}
          description="Clientes registrados"
          icon={Users2Icon}
        />
        <StatsCard
          title="Ventas realizadas"
          value={totalSales}
          description="Ventas registradas"
          icon={Shield}
        />
        <StatsCard
          title="Empleados"
          value={employees.length}
          description="Personal registrado"
          icon={IdCardIcon}
        />
      </div>
    </article>
  );
}
