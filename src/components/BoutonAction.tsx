import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  libelle: string;
  onPress: () => void;
  disabled?: boolean;
  chargement?: boolean;
};

export function BoutonAction({ libelle, onPress, disabled, chargement }: Props) {
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
        <Text style={[styles.libelle, disabled && styles.libelleInactif]}>{libelle}</Text>
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
});
