import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type Props = {
  /** Opacité du fond en haut puis en bas (0 à 1) */
  de: number;
  a: number;
  style: StyleProp<ViewStyle>;
};

// Voile vertical couleur fond (#050816) posé sur la carte
export function Degrade({ de, a, style }: Props) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="voile" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#050816" stopOpacity={de} />
            <Stop offset="1" stopColor="#050816" stopOpacity={a} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#voile)" />
      </Svg>
    </View>
  );
}
