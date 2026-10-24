import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { ProgressRing } from '@/components/ProgressRing';
import { colors, fonts, normalLineHeight, radius, shadows } from '@/theme';

// Carte lue d'un seul tenant par le lecteur d'écran (« 40, Score de prouesse ») plutôt qu'en morceaux
function Mesure({ children, ...accessibilite }: { children: ReactNode } & Omit<ViewProps, 'children' | 'style'>) {
  return (
    <View style={styles.mesure} accessible {...accessibilite}>
      {children}
    </View>
  );
}

// Les légendes peuvent contenir un retour à la ligne de mise en page
const lisible = (libelle: string) => libelle.replace(/\s*\n\s*/g, ' ');

// Paire de cartes chiffrées (ex. souvenirs et visites au parc), au format des cartes de score
export function ChiffresCards({ chiffres }: { chiffres: { valeur: number; libelle: string }[] }) {
  return (
    <View style={styles.row}>
      {chiffres.map(({ valeur, libelle }) => (
        <Mesure key={libelle} accessibilityLabel={`${valeur}, ${lisible(libelle)}`}>
          <Text style={styles.compteur}>{valeur}</Text>
          <Text style={styles.caption} numberOfLines={2}>
            {libelle}
          </Text>
        </Mesure>
      ))}
    </View>
  );
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
      <Mesure accessibilityLabel={`${score}, ${lisible(libelleScore)}`}>
        <Text style={styles.compteur}>{score}</Text>
        <Text style={styles.caption} numberOfLines={2}>
          {libelleScore}
        </Text>
      </Mesure>
      <Mesure
        accessibilityRole="progressbar"
        accessibilityLabel={lisible(libelleProgression)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progression * 100)}
        aria-valuetext={`${Math.round(progression * 100)} %`}
      >
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
