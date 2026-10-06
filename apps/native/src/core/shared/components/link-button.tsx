import { Button, type ButtonProps } from "@expo/ui/jetpack-compose";
import { type Href, useRouter } from "expo-router";

interface Props extends ButtonProps {
  action:
    | {
        href: Href;
        type: "push" | "replace";
      }
    | {
        type: "back";
      };
}

export function LinkButton({ action, ...props }: Props) {
  const router = useRouter();

  const onClick = () => {
    switch (action.type) {
      case "back": {
        router.back();
        break;
      }
      case "push": {
        router.push(action.href);
        break;
      }
      case "replace": {
        router.replace(action.href);
        break;
      }
    }
  };

  return (
    <Button
      {...props}
      onClick={() => {
        onClick();
        props.onClick?.();
      }}
    />
  );
}
