import { Image } from 'expo-image';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchField({ value, onChangeText, placeholder = 'Rechercher une prouesse…' }: Props) {
  return (
    <View style={styles.field}>
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
  icon: {
    width: 17,
    height: 17,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    padding: 0,
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
