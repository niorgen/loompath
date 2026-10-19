import { StyleSheet, Text, View } from 'react-native';

import { ListRow } from '@/components/ListRow';
import { colors, fonts, normalLineHeight } from '@/theme';

type Props = {
  titre: string;
  meta: string;
  distance: { valeur: string; unite: string };
  onPress?: () => void;
};

export function ProuesseRow({ titre, meta, distance, onPress }: Props) {
  return (
    <ListRow
      onPress={onPress}
      accessibilityLabel={`${titre}, ${meta}, à ${distance.valeur} ${distance.unite}`}
      trailing={
        <View style={styles.distance}>
          <Text style={styles.valeur}>{distance.valeur}</Text>
          <Text style={styles.unite}>{distance.unite.toUpperCase()}</Text>
        </View>
      }
    >
      <Text style={styles.titre} numberOfLines={1}>
        {titre}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {meta}
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
  meta: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  valeur: {
    fontFamily: fonts.interExtraBold,
    fontSize: 14,
    lineHeight: normalLineHeight(14),
    color: colors.textPrimary,
  },
  unite: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
});
