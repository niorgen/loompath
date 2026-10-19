import { Image } from 'expo-image';
import { StyleSheet, Text } from 'react-native';

import { ListRow } from '@/components/ListRow';
import { colors, fonts, normalLineHeight } from '@/theme';

type Props = {
  titre: string;
  indice: string;
  obtenue: boolean;
  onPress?: () => void;
};

// Prouesse d'une catégorie : badge vert si obtenue, chevron sinon
export function IndiceRow({ titre, indice, obtenue, onPress }: Props) {
  return (
    <ListRow
      onPress={onPress}
      accessibilityLabel={`${titre}, ${indice}${obtenue ? ', obtenue' : ''}`}
      trailing={
        obtenue ? (
          <Image
            source={require('../../assets/icons/badge-validation.svg')}
            style={styles.badge}
            contentFit="contain"
          />
        ) : (
          <Image
            source={require('../../assets/icons/chevron-right-16-small.svg')}
            style={styles.chevron}
            contentFit="contain"
          />
        )
      }
    >
      <Text style={styles.titre} numberOfLines={1}>
        {titre}
      </Text>
      <Text style={styles.indice} numberOfLines={1}>
        {indice}
      </Text>
    </ListRow>
  );
}

const styles = StyleSheet.create({
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  indice: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
  badge: {
    width: 22,
    height: 22,
  },
  chevron: {
    width: 16,
    height: 16,
  },
});
