import { Link } from "@tanstack/react-router";
import { useAuth } from "@/core/auth/application/providers/auth.provider";
import { Button } from "@/core/shared/components/ui/button";
import { Card } from "@/core/shared/components/ui/card";
import { Building2, Check, ChevronRight } from "lucide-react";
import { useState } from "react";

export function SelectBusinessScreen() {
  const { user } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusiness(businessId);
  };

  if (!user) {
    return <div>...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-4">
            <Building2 className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">
            Selecciona tu negocio
          </h1>
          <p className="text-muted-foreground text-pretty">
            Elige el negocio con el que deseas trabajar
          </p>
        </header>

        {/* Business Cards */}
        <article className="space-y-3 mb-6">
          {user.isRootIn.map((business) => (
            <Card
              key={business.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                selectedBusiness === business.id
                  ? "border-primary bg-accent/30"
                  : "border-border bg-card"
              }`}
              onClick={() => handleSelectBusiness(business.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                      selectedBusiness === business.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">
                      {business.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      NIT: {business.nit}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedBusiness === business.id
                      ? "border-primary bg-primary"
                      : "border-muted"
                  }`}
                >
                  {selectedBusiness === business.id && (
                    <Check className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </article>

        <Button
          disabled={!selectedBusiness}
          className="w-full h-12 text-base font-semibold"
          size="lg"
          asChild
        >
          {selectedBusiness ? (
            <Link to="/business/$id" params={{ id: selectedBusiness }}>
              Continuar
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <span>
              Continuar <ChevronRight className="w-5 h-5 ml-2" />
            </span>
          )}
        </Button>

        <footer>
          <Button variant="link">
            <Link to="/business/register">Crea un nuevo negocio</Link>
          </Button>
        </footer>
      </div>
    </div>
  );
}
