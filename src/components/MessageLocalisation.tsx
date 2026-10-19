import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  onAutoriser: () => void;
};

// Encart affiché quand la localisation est refusée : explique ce qui manque et propose de l'activer
export function MessageLocalisation({ onAutoriser }: Props) {
  const web = Platform.OS === 'web';
  return (
    <View style={styles.carte}>
      <View style={styles.textes}>
        <Text style={styles.titre}>Localisation désactivée</Text>
        <Text style={styles.texte}>
          {web
            ? 'Autorisez la position dans votre navigateur pour voir votre progression dans le parc et les prouesses à proximité.'
            : 'Activez la localisation pour voir votre progression dans le parc et les prouesses à proximité.'}
        </Text>
      </View>
      <Pressable
        onPress={onAutoriser}
        accessibilityRole="button"
        style={({ pressed }) => [styles.bouton, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.libelleBouton}>Activer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.surfaceRow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  textes: {
    flex: 1,
    gap: 4,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  texte: {
    fontFamily: fonts.interRegular,
    fontSize: 11,
    lineHeight: normalLineHeight(11),
    color: colors.textSecondary,
  },
  bouton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.action,
    borderRadius: radius.pill,
  },
  libelleBouton: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textOnAction,
  },
});
