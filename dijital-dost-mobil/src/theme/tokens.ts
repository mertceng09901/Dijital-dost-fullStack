// ─── Design Tokens — tek merkezi kaynak ──────────────────────────────────────
// Her bileşen bu dosyadan renk/boşluk/tipografi çeksin.
// Hiçbir yerde hardcoded hex renk kullanılmasın.

export const colors = {
  background:     '#F5F1EA',       // sıcak krem
  surface:        '#FFFFFF',
  surfaceGlass:   'rgba(255, 255, 255, 0.75)',
  primary:        '#6B5B95',       // mor-lila vurgu
  primaryLight:   'rgba(107, 91, 149, 0.15)',
  primaryGlow:    'rgba(107, 91, 149, 0.35)',
  secondary:      '#8B7DB5',
  accent:         '#D4A96A',       // sıcak altın vurgu
  textPrimary:    '#2C2C2C',
  textSecondary:  '#6B6B6B',
  cardShadow:     'rgba(0,0,0,0.12)',
  border:         '#E0D8CC',
  inputBg:        '#F0EBE1',
  error:          '#D9534F',
  success:        '#5BA85A',
  overlay:        'rgba(255,255,255,0.25)',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  pill: 999,
} as const;

export const typography = {
  heading: {
    fontSize:   22,
    fontWeight: '700' as const,
    color:      colors.textPrimary,
  },
  subheading: {
    fontSize:   18,
    fontWeight: '600' as const,
    color:      colors.textPrimary,
  },
  body: {
    fontSize:   15,
    fontWeight: '400' as const,
    color:      colors.textPrimary,
  },
  caption: {
    fontSize:   12,
    fontWeight: '400' as const,
    color:      colors.textSecondary,
  },
} as const;
