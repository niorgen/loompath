import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Trace, TRACES } from '@/components/Picto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  surtitre: string;
  titre: string;
  onBack: () => void;
};

// En-tête de section avec bouton précédent
export function DetailHeader({ surtitre, titre, onBack }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        style={({ pressed }) => [styles.bouton, pressed && { opacity: 0.7 }]}
      >
        <Trace trace={TRACES.retour} couleur={colors.accentSecondary} taille={20} epaisseur={2} />
      </Pressable>
      <View style={styles.titres}>
        <Text style={styles.surtitre}>{surtitre}</Text>
        <Text style={styles.titre} accessibilityRole="header">
          {titre}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 12,
  },
  bouton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceBouton,
    borderWidth: 1,
    borderColor: colors.borderBouton,
    borderRadius: radius.pill,
  },
  titres: {
    flex: 1,
    gap: 4,
  },
  surtitre: {
    fontFamily: fonts.interExtraBold,
    fontSize: 9,
    lineHeight: normalLineHeight(9),
    letterSpacing: 1.5,
    color: colors.surtitre,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 23,
    lineHeight: 23 * 1.1,
    color: colors.textPrimaryAlt,
  },
});
