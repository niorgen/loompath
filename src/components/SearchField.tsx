import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius, sansContourWeb } from '@/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchField({ value, onChangeText, placeholder = 'Rechercher une prouesse…' }: Props) {
  // Le champ entier s'entoure de lavande pendant la saisie (à la place du contour du navigateur)
  const [actif, setActif] = useState(false);
  return (
    <View style={[styles.field, actif && styles.fieldActif]}>
      <Image
        source={require('../../assets/icons/search.svg')}
        style={styles.icon}
        contentFit="contain"
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.accent}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel={placeholder}
        onFocus={() => setActif(true)}
        onBlur={() => setActif(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  fieldActif: {
    borderColor: colors.accentSecondary,
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
    color: colors.textPrimary,
  },
});
