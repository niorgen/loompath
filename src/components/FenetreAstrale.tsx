import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { useSourcePhoto } from '@/hooks/useSourcePhoto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  photoUri?: string;
  /** Vignette de secours si la photo n'est plus lisible */
  miniature?: string;
  libelle: string;
};

// Cadre de l'illustration : photo de validation (ou sa miniature), sinon emplacement en pointillés
export function FenetreAstrale({ photoUri, miniature, libelle }: Props) {
  const { source, onError } = useSourcePhoto(photoUri, miniature);

  return (
    <View style={styles.cadre}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={styles.photo}
          contentFit="cover"
          accessibilityLabel={libelle}
          onError={onError}
        />
      ) : (
        <View style={styles.illustration}>
          <Image
            source={require('../../assets/icons/orbit.svg')}
            style={styles.orbit}
            contentFit="contain"
          />
          <Text style={styles.libelle}>{libelle.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: {
    height: 236,
    alignSelf: 'stretch',
    padding: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  illustration: {
    flex: 1,
    gap: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceIllustration,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderCard,
    borderRadius: radius.md,
  },
  photo: {
    flex: 1,
    borderRadius: radius.md,
  },
  orbit: {
    width: 24,
    height: 24,
  },
  libelle: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textPrimaryAlt,
    textAlign: 'center',
  },
});
