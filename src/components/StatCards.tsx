import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressRing } from '@/components/ProgressRing';
import { colors, fonts, normalLineHeight, radius, shadows } from '@/theme';

function Mesure({ children }: { children: ReactNode }) {
  return <View style={styles.mesure}>{children}</View>;
}

type Props = {
  score: number;
  /** Progression entre 0 et 1 */
  progression: number;
  /** Légendes du score et de la progression (ex. pour un parc) */
  libelleScore?: string;
  libelleProgression?: string;
};

// « Météo magique » : score de prouesse + progression
export function StatCards({
  score,
  progression,
  libelleScore = 'Score de prouesse',
  libelleProgression = 'Votre\nprogression',
}: Props) {
  return (
    <View style={styles.row}>
      <Mesure>
        <Text style={styles.compteur}>{score}</Text>
        <Text style={styles.caption} numberOfLines={2}>
          {libelleScore}
        </Text>
      </Mesure>
      <Mesure>
        <ProgressRing value={progression} />
        <Text style={styles.caption} numberOfLines={2}>
          {libelleProgression}
        </Text>
      </Mesure>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  mesure: {
    flex: 1,
    height: 112,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    boxShadow: shadows.card,
  },
  compteur: {
    fontFamily: fonts.loraBold,
    fontSize: 28,
    lineHeight: 36,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  caption: {
    fontFamily: fonts.interExtraBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
