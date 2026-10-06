const UNIT = 4;

const STEPS = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24,
  28, 32, 40, 48, 56, 64,
] as const;

export type Step = (typeof STEPS)[number];

export const sp = (step: Step = 0): number => step * UNIT;
export const px = 1;

export const SIZE = {
  full: "100%",
  half: "50%",
  third: "33.333333%",
  twoThirds: "66.666667%",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 96,
  "5xl": 128,
  "6xl": 192,
  "7xl": 256,
} as const;

export type SpacingKey = keyof typeof SPACING;
