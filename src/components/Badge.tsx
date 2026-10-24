import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  libelle: string;
  /** « accent » : parc (lavande) ; « action » : type de prouesse (bleu) */
  ton: 'accent' | 'action';
};

// « Loompath / Badge » du design : pastille pleine en capitales espacées
export function Badge({ libelle, ton }: Props) {
  return (
    <View style={[styles.badge, ton === 'action' && styles.badgeAction]}>
      <Text style={[styles.libelle, ton === 'action' && styles.libelleAction]} numberOfLines={1}>
        {libelle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.accentSecondary,
    borderRadius: radius.pill,
  },
  badgeAction: {
    backgroundColor: colors.action,
  },
  libelle: {
    fontFamily: fonts.interExtraBold,
    fontSize: 9,
    lineHeight: normalLineHeight(9),
    letterSpacing: 1.5,
    color: colors.textOnLight,
  },
  // Texte sombre sur le bleu : 6,5:1 (le blanc ne faisait que 3:1, RGAA 3.2)
  libelleAction: {
    color: colors.background,
  },
});
