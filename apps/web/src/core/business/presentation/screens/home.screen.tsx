import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { HomeHeaderSection } from "../sections/home-header.section";
import { PageHeader } from "@/core/shared/components/page-header";
import { HomeDataTablesSection } from "../sections/home-data-tables.section";
import { ChartAreaInteractive } from "@/core/shared/components/chart-area-interactive";

interface Props {
  businessId: string;
}

export function HomeScreen({ businessId }: Props) {
  const { data } = useFindOneBusiness(businessId);

  return (
    <section className="mx-2">
      <PageHeader title="Inicio" />
      <div className="mx-2 mt-2 space-y-6">
        <HomeHeaderSection business={data} />
        <ChartAreaInteractive />
        <HomeDataTablesSection business={data} />
      </div>
    </section>
  );
}
