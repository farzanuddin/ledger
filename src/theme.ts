export const colors = {
  background: "#f4f1ea",
  border: "#d9d6ca",
  danger: "#b14a3b",
  muted: "#526062",
  primary: "#2e766f",
  placeholder: "#7f8a8d",
  reportBorder: "#ece8dd",
  surface: "#ffffff",
  syncText: "#6b7678",
  text: "#172426",
  textMuted: "#687476",
  overlay: "rgba(0,0,0,0.4)",
} as const;

export const radii = {
  control: 8,
  dialog: 12,
  sheet: 16,
  pill: 100,
} as const;

export const sizes = {
  compactIconButton: 34,
  balanceIconButton: 36,
  tabMinHeight: 42,
  controlMinHeight: 44,
  largeControlMinHeight: 50,
  iconButton: 44,
  modalActionMinHeight: 48,
} as const;

export const spacing = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 10,
  section: 14,
  panel: 16,
  card: 18,
  modal: 20,
  screen: 20,
} as const;

export const typography = {
  sizes: {
    xxs: 11,
    xs: 12,
    sm: 13,
    md: 14,
    base: 15,
    input: 16,
    title: 18,
    icon: 21,
    balance: 38,
  },
  weights: {
    semibold: "700",
    bold: "800",
    heavy: "900",
  },
} as const;

export const opacity = {
  disabled: 0.6,
  pressed: 0.86,
} as const;

import type { ViewStyle } from "react-native";

export const commonStyles = {
  buttonPressed: { opacity: opacity.pressed },
  buttonDisabled: { opacity: opacity.disabled },
} as const;

export const modalStyles = {
  header: {
    alignItems: "center" as const,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    padding: spacing.modal,
    paddingBottom: 0,
  },
  title: {
    color: colors.text,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
  },
  body: {
    padding: spacing.modal,
  },
};

type PressableStyle = ViewStyle | false | undefined | null;

export const withButtonState =
  (base: ViewStyle, isDisabled: boolean) =>
  ({ pressed }: { pressed: boolean }): PressableStyle[] => [
    base,
    pressed && !isDisabled && commonStyles.buttonPressed,
    isDisabled && commonStyles.buttonDisabled,
  ];
