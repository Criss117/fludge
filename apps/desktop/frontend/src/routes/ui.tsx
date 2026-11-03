import { Button } from "@fludge/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@fludge/ui/components/card";
import { Input } from "@fludge/ui/components/input";
import { Label } from "@fludge/ui/components/label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/ui")({ component: UiShowcase });

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

function UiShowcase() {
  const [name, setName] = useState("");

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium">Design system</h1>
        <p className="text-muted-foreground text-xs">
          Tailwind CSS v4 and shadcn components served from <code>@fludge/ui</code>.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Local state</CardTitle>
          <CardDescription>Shadcn input, label and button wired together.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            placeholder="anonymous"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <p className="text-muted-foreground text-xs">Hello, {name.trim() || "anonymous"}.</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => setName("")}>Reset</Button>
          <Button variant="outline" onClick={() => setName("Wails")}>
            Use Wails
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Link to="/" className="text-muted-foreground text-xs underline underline-offset-4">
        Back to the Wails demo
      </Link>
    </main>
  );
}
