import type { AllOrganizations } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Avatar } from "heroui-native/avatar";
import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { Chip } from "heroui-native/chip";

interface Props {
  onPress: (organizationId: string) => void;
  isPending: boolean;
  organization: AllOrganizations[number];
}

export const CARD_HEIGHT = 170;

export function OrganizationCard({ organization, isPending, onPress }: Props) {
  return (
    <PressableFeedback
      onPress={() => onPress(organization.id)}
      isDisabled={isPending}
    >
      <Card
        className="flex flex-row items-start gap-x-2"
        style={{ height: CARD_HEIGHT }}
      >
        <Avatar>
          <Avatar.Fallback>
            {organization.name.charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
        <View className="flex-1 flex-row items-center gap-x-2">
          <View className="flex-1">
            <Card.Header>
              <View className="flex-row gap-x-2">
                <View className="flex-1">
                  <Card.Title className="line-clamp-1">
                    {organization.name}
                  </Card.Title>
                </View>

                <Chip>
                  <Chip.Label>{organization.status}</Chip.Label>
                </Chip>
              </View>
              <Card.Description className="line-clamp-1">
                {organization.legalName}
              </Card.Description>
              <Card.Description className="line-clamp-1">
                {organization.taxId}
              </Card.Description>
            </Card.Header>
            <Card.Body className="flex-1">
              <View className="flex flex-row items-center gap-x-2">
                <MaterialIcons
                  name="location-pin"
                  size={16}
                  className="text-accent"
                />
                <Typography className="line-clamp-1">
                  {organization.address}
                </Typography>
              </View>
              <View className="flex flex-row items-center gap-x-2">
                <MaterialIcons name="phone" size={16} className="text-accent" />
                <Typography className="line-clamp-1">
                  {organization.phone}
                </Typography>
              </View>
            </Card.Body>
          </View>
          <Card.Footer>
            <MaterialIcons
              name="chevron-right"
              size={24}
              className="text-accent"
            />
          </Card.Footer>
        </View>
      </Card>
    </PressableFeedback>
  );
}
