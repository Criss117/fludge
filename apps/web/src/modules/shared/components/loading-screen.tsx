import { LoaderCircle } from "lucide-react";

interface Props {
  messages?: string | string[];
}

export function LoadingScreen({ messages }: Props) {
  const arrayMessages = messages
    ? Array.isArray(messages)
      ? messages
      : [messages]
    : [];

  return (
    <div className="flex items-center justify-center h-screen flex-col gap-y-5">
      <h1 className="text-5xl font-semibold text-primary">Fludge</h1>
      <LoaderCircle className="animate-spin h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      {arrayMessages.map((message, index) => (
        <p key={index} className="text-sm text-muted-foreground">
          {message}...
        </p>
      ))}
    </div>
  );
}
