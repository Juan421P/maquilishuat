export const T = {
  sidebarBg: "#5b1570",
  sidebarDeep: "#4a0d5c",
  pink: "#ec4899",
  purple: "#a855f7",
  purpleMid: "#9333ea",
  purpleDark: "#7e22ce",
  cyan: "#06b6d4",
  cyanLight: "#22d3ee",
  bg: "#f8f9fb",
  surface: "#ffffff",
  border: "#e8eaed",
  text1: "#111827",
  text2: "#374151",
  text3: "#6b7280",
  textMut: "#9ca3af",
  red: "#ef4444",
  green: "#22c55e",
  amber: "#f59e0b",
};

// react-native-linear-gradient / expo-linear-gradient quieren un array de colores,
// no un string CSS. Mantenemos ambos formatos por conveniencia.
export const GRAD_COLORS = [T.pink, T.purple, T.cyan];
export const GRAD_SIDEBAR_COLORS = [T.sidebarBg, T.sidebarDeep];
