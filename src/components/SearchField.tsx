import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { anneauFocusWeb, colors, fonts, radius, sansContourWeb } from '@/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** La recherche ne donne aucun résultat : champ en rose */
  erreur?: boolean;
};

// Champ de recherche (Figma « Composants » 2:4902) : vide, rempli (bordure lavande + effacer) ou en erreur
export function SearchField({ value, onChangeText, placeholder = 'Rechercher une prouesse…', erreur }: Props) {
  const rempli = value.length > 0;
  const enErreur = rempli && erreur;
  const [focus, setFocus] = useState(false);

  // « Aucun résultat » annoncé au lecteur d'écran (RGAA 7.5) : iOS n'a pas de zone live
  useEffect(() => {
    if (enErreur && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(AUCUN_RESULTAT);
  }, [enErreur]);

  return (
    <View
      style={[styles.field, enErreur ? styles.fieldErreur : rempli && styles.fieldRempli, focus && anneauFocusWeb]}
    >
      <Image
        source={require('../../assets/icons/search.svg')}
        style={styles.icon}
        contentFit="contain"
        tintColor={rempli && !enErreur ? colors.accent : undefined}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.accent}
        style={[styles.input, enErreur && styles.inputErreur]}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
      {rempli && !enErreur ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche"
          hitSlop={12}
        >
          <Image source={require('../../assets/icons/circle-x.svg')} style={styles.effacer} contentFit="contain" />
        </Pressable>
      ) : null}
      {/* Zone live (Android, web) : son texte est lu dès qu'il apparaît, sans être affiché */}
      <View aria-live="polite" style={styles.masque}>
        {enErreur ? <Text>{AUCUN_RESULTAT}</Text> : null}
      </View>
    </View>
  );
}

const AUCUN_RESULTAT = 'Aucun résultat';

const styles = StyleSheet.create({
  field: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
    paddingHorizontal: 14,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  fieldRempli: {
    borderWidth: 2,
    borderColor: colors.accent,
    // La bordure de 2 px ne décale pas le contenu
    paddingHorizontal: 13,
  },
  fieldErreur: {
    borderColor: colors.erreur,
  },
  icon: {
    width: 17,
    height: 17,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    padding: 0,
    ...sansContourWeb,
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputErreur: {
    color: colors.erreur,
  },
  effacer: {
    width: 16,
    height: 16,
  },
  masque: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});
