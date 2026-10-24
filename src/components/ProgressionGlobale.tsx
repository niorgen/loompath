import { StyleSheet, Text, View } from 'react-native';

import { DegradeAccent } from '@/components/Fonds';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  obtenues: number;
  total: number;
};

// Ligne de progression sans fond : pourcentage, compteur et jauge
export function ProgressionGlobale({ obtenues, total }: Props) {
  const ratio = total > 0 ? Math.min(obtenues / total, 1) : 0;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${obtenues} prouesses obtenues sur ${total}`}
      accessibilityValue={{ min: 0, max: total, now: obtenues }}
    >
      <View style={styles.stats}>
        <Text style={styles.pourcentage}>{Math.round(ratio * 100)} %</Text>
        <Text style={styles.compteur}>
          {obtenues}/{total} prouesses
        </Text>
      </View>
      <View style={styles.jauge}>
        <View style={[styles.atteinte, { width: `${ratio * 100}%` }]}>
          <DegradeAccent />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pourcentage: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.accent,
  },
  compteur: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
  jauge: {
    height: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.21)',
    borderRadius: radius.pill,
  },
  atteinte: {
    height: 6,
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
});
