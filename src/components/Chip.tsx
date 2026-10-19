import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  libelle: string;
  /** Chip sélectionnée (filtres) */
  actif?: boolean;
  onPress?: () => void;
};

// « Thème » du design : pastille bordée, cliquable quand elle sert de filtre
export function Chip({ libelle, actif, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? { selected: !!actif } : undefined}
      style={({ pressed }) => [styles.chip, actif && styles.chipActif, pressed && { opacity: 0.8 }]}
    >
      <Text style={[styles.libelle, actif && styles.libelleActif]} numberOfLines={1}>
        {libelle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 26,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
  },
  chipActif: {
    backgroundColor: colors.accentSecondary,
  },
  libelle: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
  libelleActif: {
    fontFamily: fonts.interBold,
    color: colors.textOnLight,
  },
});
