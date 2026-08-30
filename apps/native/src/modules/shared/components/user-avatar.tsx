import { Avatar } from "heroui-native/avatar";
import type { ComponentProps } from "react";

interface Props {
  name: string;
  image?: string | null;
  avatarProps?: ComponentProps<typeof Avatar>;
}

export function UserAvatar({ name, image, avatarProps }: Props) {
  return (
    <Avatar {...avatarProps}>
      {image && <Avatar.Image src={image} />}
      {!image && (
        <Avatar.Image
          source={{
            uri: `https://picsum.photos/seed/${name}/200`,
          }}
        />
      )}
      <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
    </Avatar>
  );
}
