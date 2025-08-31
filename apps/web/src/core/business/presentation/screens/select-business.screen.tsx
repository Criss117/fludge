import { Link } from "@tanstack/react-router";
import { useAuth } from "@/core/auth/application/providers/auth.provider";
import { Button } from "@/core/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";

export function SelectBusinessScreen() {
  const { user } = useAuth();

  if (!user) {
    return <div>...</div>;
  }

  return (
    <section className="w-full min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <h1 className="text-5xl text-primary font-bold text-center">
            Fludge
          </h1>
          <CardTitle className="text-2xl font-bold">
            Selecciona tu negocio
          </CardTitle>
          <CardDescription>
            Aquí puedes ver y seleccionar tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {user.isRootIn.map((business) => (
            <Button asChild variant="link">
              <Link
                to={"/business/$id"}
                params={{
                  id: business.id,
                }}
              >
                {business.name}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
