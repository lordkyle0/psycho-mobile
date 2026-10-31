export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  title: string;
  accent: string;
  accentSoft: string;
  parent: string;
  parentSoft: string;
  violet: string;
  violetSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  night: string;
  nightSoft: string;
  background: string;
  backgroundSecondary: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
  success: string;
  successSoft: string;
  white: string;
  shadow: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  primary: '#7A5C2E',
  primaryDark: '#5C4320',
  primarySoft: '#F3EAD9',
  title: '#1F1B16',
  accent: '#B88A44',
  accentSoft: '#FAF1E1',
  parent: '#3F8F5F',
  parentSoft: '#E3F3E9',
  violet: '#5B5FC7',
  violetSoft: '#ECECFB',
  warning: '#C98A1A',
  warningSoft: '#FDF3DD',
  danger: '#B23A48',
  dangerSoft: '#F9E6E8',
  night: '#1F1B16',
  nightSoft: '#2B2620',
  background: '#FFFFFF',
  backgroundSecondary: '#F6F3EE',
  foreground: '#3B342C',
  card: '#FFFFFF',
  muted: '#EFE8DC',
  mutedForeground: '#6E665C',
  border: '#E4DDD2',
  success: '#3F8F5F',
  successSoft: '#E3F3E9',
  white: '#FFFFFF',
  shadow: '#1F1B16',
  overlay: 'rgba(122, 92, 46, 0.06)',
};

export const darkColors: ThemeColors = {
  primary: '#D2A55E',
  primaryDark: '#B88A44',
  primarySoft: '#3A2F1F',
  title: '#F2ECE3',
  accent: '#E0B670',
  accentSoft: '#2E2617',
  parent: '#6CC08B',
  parentSoft: '#15291D',
  violet: '#9B9EF0',
  violetSoft: '#22234A',
  warning: '#E0B670',
  warningSoft: '#2E2617',
  danger: '#E06C75',
  dangerSoft: '#3B1A1E',
  night: '#0E0C0A',
  nightSoft: '#1A1713',
  background: '#14120F',
  backgroundSecondary: '#14120F',
  foreground: '#E9E2D7',
  card: '#1F1C18',
  muted: '#2B2620',
  mutedForeground: '#A69C8E',
  border: '#332E27',
  success: '#6CC08B',
  successSoft: '#15291D',
  white: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(255, 255, 255, 0.04)',
};

/** @deprecated Use useTheme().colors instead */
export const colors = lightColors;
