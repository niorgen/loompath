import { Pressable, StyleSheet, Text } from 'react-native';

import { DegradeAccent } from '@/components/Fonds';
import { Trace, TRACES } from '@/components/Picto';
import { colors, fonts, illustration, normalLineHeight, radius } from '@/theme';

type Props = {
  libelle: string;
  onPress: () => void;
  disabled?: boolean;
  /** Tracé (TRACES) avant le libellé */
  icone?: string;
  /** Flèche après le libellé (« Suivant → ») */
  fleche?: boolean;
};

// Grand bouton dégradé lavande → rose de l'introduction et de la validation (artifact « Design »)
export function BoutonPrincipal({ libelle, onPress, disabled, icone, fleche }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.bouton, disabled && styles.boutonInactif, pressed && { opacity: 0.85 }]}
    >
      {!disabled ? <DegradeAccent /> : null}
      {icone && !disabled ? <Trace trace={icone} couleur={colors.background} taille={20} epaisseur={2} /> : null}
      <Text style={[styles.libelle, disabled && styles.libelleInactif]}>{libelle}</Text>
      {fleche && !disabled ? <Trace trace={TRACES.fleche} couleur={colors.background} taille={20} epaisseur={2} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bouton: {
    height: 56,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.accentSecondary,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  boutonInactif: {
    backgroundColor: illustration.pastille,
  },
  libelle: {
    fontFamily: fonts.interBold,
    fontSize: 16,
    lineHeight: normalLineHeight(16),
    color: colors.background,
  },
  libelleInactif: {
    color: illustration.inactif,
  },
});
