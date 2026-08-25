import { render, screen } from "@testing-library/react-native";
import { HeroUINativeProvider } from "heroui-native/provider";
import HomeScreen from "@/app/index";

describe("<HomeScreen />", () => {
  it("renders correctly", async () => {
    await render(
      <HeroUINativeProvider>
        <HomeScreen />
      </HeroUINativeProvider>
    );
    expect(screen.getByText(/Edit src\/app\/index.tsx/)).toBeTruthy();
  });
});
