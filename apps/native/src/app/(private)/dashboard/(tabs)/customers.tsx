import { Link } from "expo-router";

export default function DashboardCustomers() {
  return (
    <>
      <Link
        href={{
          pathname: "/dashboard/customers/create",
        }}
      >
        Creare
      </Link>
    </>
  );
}
