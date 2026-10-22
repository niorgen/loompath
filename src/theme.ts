// Tokens issus du Figma Loompath (fichier CnUNdVoaoc5vBHQH8xrdB3)
export const colors = {
  background: '#050816',
  surface: '#151e43',
  surfaceRaised: '#18234f',
  surfaceRow: '#10183a',
  surfaceSunken: '#111a36',
  surfacePlaceholder: '#1b2a5b',
  surfaceIllustration: '#212d58',
  surfacePhoto: '#171d32',
  action: '#4e97de',
  actionSecondary: '#477fc4',
  textOnAction: '#fffdf7',
  border: '#4e6094',
  borderCard: '#5368a3',
  borderNav: 'rgba(76,96,148,0.78)',
  borderSubtle: '#30374e',
  divider: '#363651',
  textPrimary: '#f3efff',
  textPrimaryAlt: '#f2eeff',
  textSecondary: '#a8b0d3',
  textNavInactive: '#a8aed2',
  textOnLight: '#17203a',
  accent: '#cab5ff',
  accentSecondary: '#c9b5ff',
} as const;

// Teintes propres aux illustrations de l'introduction et de la validation (artifact « Design »)
export const illustration = {
  papier: '#F4F1FF',
  encre: '#141A3A',
  encreDouce: '#4A5280',
  nuit: '#1A2250',
  carte: '#121937',
  bord: '#2A3466',
  bordFort: '#3A4580',
  piste: '#232B5E',
  pastille: '#1E2656',
  jauge: '#252E5C',
  texteDoux: '#C4C8E6',
  texteListe: '#DCDDF2',
  inactif: '#8F96C4',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  xl: 24,
  pill: 999,
} as const;

export const fonts = {
  interRegular: 'Inter_400Regular',
  interBold: 'Inter_700Bold',
  interExtraBold: 'Inter_800ExtraBold',
  loraBold: 'Lora_700Bold',
} as const;

// Hauteur de ligne « normal » d'Inter (~1.21 × taille)
export const normalLineHeight = (size: number) => Math.round(size * 1.21);

export const shadows = {
  card: '0px 12px 32px 0px rgba(2,6,23,0.33)',
  nav: '0px 10px 12px 0px rgba(2,6,23,0.48)',
} as const;
