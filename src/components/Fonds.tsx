import { useId, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { degrades } from '@/theme';

// Identifiant de gradient propre à chaque instance (deux SVG partageant un id afficheraient le même)
const useGradientId = (prefixe: string) => `${prefixe}-${useId().replace(/[^\w-]/g, '')}`;

// Halo (centre et rayons en fraction de l'écran) et position du palier central du fond
const VARIANTES = {
  /** Écrans à onglets et détails : halo resserré en haut */
  page: { haloY: 0.08, haloRx: 0.72, haloRy: 0.24, milieu: 0.4 },
  /** Introduction et prouesse validée : halo derrière l'illustration */
  scene: { haloY: 0.22, haloRx: 0.72, haloRy: 0.36, milieu: 0.45 },
  /** Splash : halo derrière le logo */
  splash: { haloY: 0.42, haloRx: 0.72, haloRy: 0.36, milieu: 0.5 },
} as const;

type FondNuitProps = {
  variante?: keyof typeof VARIANTES;
};

// Fond « nuit » des écrans : dégradé vertical et halo violet, posé derrière le contenu
export function FondNuit({ variante = 'page' }: FondNuitProps) {
  const fond = useGradientId('nuit');
  const halo = useGradientId('halo');
  const { haloY, haloRx, haloRy, milieu } = VARIANTES[variante];
  const [haut, centre, bas] = degrades.nuit;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={fond} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={haut} />
            <Stop offset={milieu} stopColor={centre} />
            <Stop offset="1" stopColor={bas} />
          </LinearGradient>
          {/* Rapporté à l'ellipse qui le porte : le halo en prend la forme */}
          <RadialGradient id={halo} cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <Stop offset="0" stopColor={degrades.halo} stopOpacity={1} />
            <Stop offset="1" stopColor={degrades.halo} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${fond})`} />
        <Ellipse
          cx="50%"
          cy={`${haloY * 100}%`}
          rx={`${haloRx * 100}%`}
          ry={`${haloRy * 100}%`}
          fill={`url(#${halo})`}
        />
      </Svg>
    </View>
  );
}

// Enveloppe d'écran pour `screenLayout` : fond « nuit » derrière chaque écran d'un navigateur
// (les écrans eux-mêmes restent transparents)
export function avecFondNuit({ children }: { children: ReactNode }) {
  return (
    <View style={styles.ecran}>
      <FondNuit />
      {children}
    </View>
  );
}

// Dégradé d'accent horizontal (lavande → rose) qui remplit son parent ;
// le parent fixe la forme (borderRadius + overflow: 'hidden')
export function DegradeAccent({ style }: { style?: StyleProp<ViewStyle> }) {
  const id = useGradientId('accent');
  const [debut, fin] = degrades.accent;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={debut} />
            <Stop offset="1" stopColor={fin} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
  },
});
