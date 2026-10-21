import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  nom: string;
  taille?: number;
};

// Pastille du joueur : initiale de son nom (« ? » tant qu'il n'en a pas), cerclée d'un anneau
export function Avatar({ nom, taille = 96 }: Props) {
  const initiale = nom.trim().charAt(0).toUpperCase() || '?';
  const anneau = Math.round(taille / 16);
  return (
    <View
      style={[styles.anneau, { padding: anneau, borderRadius: taille / 2 + anneau }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.pastille, { width: taille, height: taille, borderRadius: taille / 2 }]}>
        <Text style={[styles.initiale, { fontSize: taille * 0.42, lineHeight: taille * 0.5 }]}>{initiale}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anneau: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  pastille: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSecondary,
  },
  initiale: {
    fontFamily: fonts.loraBold,
    color: colors.background,
  },
});
