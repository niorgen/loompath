import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts, normalLineHeight } from '@/theme';

type Props = {
  /** Progression entre 0 et 1 */
  value: number;
  size?: number;
};

// Reproduit les assets Figma « Track » / « Progress » (anneau 56 px, épaisseur 5,04 px)
// en version pilotée par la donnée.
export function ProgressRing({ value, size = 56 }: Props) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const strokeWidth = size * 0.09;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.102)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          // Départ en haut, sens horaire
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.label}>{Math.round(clamped * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.interExtraBold,
    fontSize: 16,
    lineHeight: normalLineHeight(16),
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
