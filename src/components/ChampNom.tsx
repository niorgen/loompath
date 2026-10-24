import { StyleSheet, Text, TextInput, View } from 'react-native';

import { NOM_MAX, nomValide } from '@/state/profil';
import { colors, fonts, normalLineHeight, radius, sansContourWeb } from '@/theme';

type Props = {
  valeur: string;
  onChange: (nom: string) => void;
  onValider?: () => void;
  autoFocus?: boolean;
};

// Saisie du nom du joueur (2 à 20 caractères), avec compteur
export function ChampNom({ valeur, onChange, onValider, autoFocus }: Props) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label} nativeID="libelle-nom">
        Nom du joueur
      </Text>
      <TextInput
        value={valeur}
        onChangeText={onChange}
        onSubmitEditing={onValider}
        maxLength={NOM_MAX}
        autoFocus={autoFocus}
        autoComplete="nickname"
        autoCorrect={false}
        returnKeyType="done"
        placeholder="Votre pseudo"
        placeholderTextColor={colors.textSecondary}
        accessibilityLabelledBy="libelle-nom"
        style={[styles.saisie, nomValide(valeur) && styles.saisieValide]}
      />
      <View style={styles.aide}>
        <Text style={styles.texteAide}>Visible uniquement par vous, sauf partage</Text>
        <Text style={styles.texteAide}>
          {valeur.length}/{NOM_MAX}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  champ: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.interBold,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textPrimaryAlt,
  },
  saisie: {
    height: 56,
    paddingHorizontal: 16,
    fontFamily: fonts.interBold,
    fontSize: 17,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceRow,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md + 4,
    ...sansContourWeb,
  },
  saisieValide: {
    borderColor: colors.accentSecondary,
  },
  aide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  texteAide: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textSecondary,
  },
});
