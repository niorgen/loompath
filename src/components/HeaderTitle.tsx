import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, normalLineHeight } from '@/theme';

type Props = {
  surtitre?: string;
  titre: string;
  sousTitre?: string;
};

export function HeaderTitle({ surtitre, titre, sousTitre }: Props) {
  return (
    <View style={styles.container}>
      {surtitre ? <Text style={styles.surtitre}>{surtitre.toUpperCase()}</Text> : null}
      <Text style={styles.titre} accessibilityRole="header">
        {titre}
      </Text>
      {sousTitre ? <Text style={styles.sousTitre}>{sousTitre}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    alignSelf: 'stretch',
  },
  surtitre: {
    fontFamily: fonts.interExtraBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    letterSpacing: 1.2,
    color: colors.accent,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 34,
    lineHeight: 34 * 1.02,
    color: colors.textPrimary,
  },
  sousTitre: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: 13 * 1.45,
    color: colors.textSecondary,
  },
});
