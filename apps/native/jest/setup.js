const mockReanimated = require("react-native-reanimated/mock");

// The bundled mock intentionally omits useReducedMotion ("ADD ME IF NEEDED"),
// but heroui-native's GlobalAnimationSettingsProvider reads it on mount.
mockReanimated.useReducedMotion = () => false;

jest.mock("react-native-reanimated", () => mockReanimated);
require("react-native-reanimated").setUpTests();
