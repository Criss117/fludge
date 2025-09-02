import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";

interface Props {
  title: string;
}

export function PageHeader({ title }: Props) {
  return (
    <header className="h-10 py-2 flex items-center space-x-2 border-b">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-full" />
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </header>
  );
}
