import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        <Image
          source={require('../../assets/icons/chevron-left-16.svg')}
          style={styles.chevron}
          contentFit="contain"
        />
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
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
  },
  chevron: {
    width: 16,
    height: 16,
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
    color: colors.accentSecondary,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 23,
    lineHeight: 23 * 1.1,
    color: colors.textPrimaryAlt,
  },
});
