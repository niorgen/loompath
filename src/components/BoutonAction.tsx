import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

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
      {chargement ? (
        <ActivityIndicator color={colors.textOnAction} />
      ) : (
        <>
          {picto ? <Picto nom={picto} couleur={disabled ? colors.textSecondary : colors.textOnAction} /> : null}
          <Text style={[styles.libelle, disabled && styles.libelleInactif]}>{libelle}</Text>
          {fleche ? (
            <Image
              source={require('../../assets/icons/arrow-right.svg')}
              style={styles.fleche}
              contentFit="contain"
              tintColor={disabled ? colors.textSecondary : undefined}
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
    backgroundColor: colors.action,
    borderRadius: radius.pill,
  },
  boutonInactif: {
    backgroundColor: colors.surfaceRaised,
  },
  libelle: {
    fontFamily: fonts.interExtraBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textOnAction,
  },
  libelleInactif: {
    color: colors.textSecondary,
  },
  fleche: {
    width: 16,
    height: 16,
  },
});
