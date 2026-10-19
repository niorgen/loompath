import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props<T extends string> = {
  segments: { valeur: T; libelle: string }[];
  valeur: T;
  onChange: (valeur: T) => void;
};

export function SegmentedControl<T extends string>({ segments, valeur, onChange }: Props<T>) {
  return (
    <View style={styles.controle} accessibilityRole="tablist">
      {segments.map((segment) => {
        const actif = segment.valeur === valeur;
        return (
          <Pressable
            key={segment.valeur}
            onPress={() => onChange(segment.valeur)}
            accessibilityRole="tab"
            accessibilityState={{ selected: actif }}
            style={[styles.segment, actif && styles.segmentActif]}
          >
            <Text style={[styles.libelle, actif && styles.libelleActif]}>{segment.libelle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  controle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderNav,
    borderRadius: radius.pill,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  segmentActif: {
    backgroundColor: colors.accentSecondary,
  },
  libelle: {
    fontFamily: fonts.interExtraBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textNavInactive,
  },
  libelleActif: {
    color: colors.textOnLight,
  },
});
