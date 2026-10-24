import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { DegradeAccent } from '@/components/Fonds';
import { Picto } from '@/components/Picto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  libelle: string;
  onPress: () => void;
  disabled?: boolean;
  chargement?: boolean;
  /** Picto de la planche avant le libellé (ex. « Point photo » pour l'appareil photo) */
  picto?: string;
  /** Flèche après le libellé (« Lancer la quête → ») */
  fleche?: boolean;
};

export function BoutonAction({ libelle, onPress, disabled, chargement, picto, fleche }: Props) {
  const inactif = disabled || chargement;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactif}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactif, busy: chargement }}
      style={({ pressed }) => [
        styles.bouton,
        disabled && styles.boutonInactif,
        pressed && { opacity: 0.85 },
      ]}
    >
      {!disabled ? <DegradeAccent /> : null}
      {chargement ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <>
          {picto ? <Picto nom={picto} couleur={disabled ? colors.textSecondary : colors.background} /> : null}
          <Text style={[styles.libelle, disabled && styles.libelleInactif]}>{libelle}</Text>
          {fleche ? (
            <Image
              source={require('../../assets/icons/arrow-right.svg')}
              style={styles.fleche}
              contentFit="contain"
              tintColor={disabled ? colors.textSecondary : colors.background}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    height: 48,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.accentSecondary,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  boutonInactif: {
    backgroundColor: colors.surfaceRaised,
  },
  libelle: {
    fontFamily: fonts.interExtraBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.background,
  },
  libelleInactif: {
    color: colors.textSecondary,
  },
  fleche: {
    width: 16,
    height: 16,
  },
});
