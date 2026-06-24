export const colors = {
  bg: '#08080A',
  bgRaised: '#0F0F13',
  purple: '#4759E4',
  purpleDeep: '#3647C4',
  purpleSoft: 'rgba(71, 89, 228, 0.16)',
  purpleSofter: 'rgba(71, 89, 228, 0.08)',
  white: '#F3F3F9',
  red: '#EE2F39',
  pink: '#F4566B',
  pinkSoft: 'rgba(244, 86, 107, 0.16)',

  text: '#F3F3F9',
  textMuted: 'rgba(243, 243, 249, 0.56)',
  textFaint: 'rgba(243, 243, 249, 0.38)',
  textDim: 'rgba(243, 243, 249, 0.26)',

  glass: 'rgba(255, 255, 255, 0.05)',
  glassStrong: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassBorderSoft: 'rgba(255, 255, 255, 0.06)',
  hairline: 'rgba(243, 243, 249, 0.08)',

  trackDark: 'rgba(243, 243, 249, 0.10)',
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const font = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const type = {
  hero: { fontFamily: font.bold, fontSize: 42, lineHeight: 46, letterSpacing: -1.2, color: colors.text },
  title: { fontFamily: font.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.8, color: colors.text },
  section: { fontFamily: font.semibold, fontSize: 21, letterSpacing: -0.4, color: colors.text },
  card: { fontFamily: font.semibold, fontSize: 18, letterSpacing: -0.3, color: colors.text },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  bodyMuted: { fontFamily: font.regular, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  label: { fontFamily: font.medium, fontSize: 13, color: colors.textMuted },
  eyebrow: {
    fontFamily: font.semibold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.purple,
  },
  metaNum: { fontFamily: font.bold, fontVariant: ['tabular-nums'] },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  glow: {
    shadowColor: colors.purple,
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
};
