import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, normalLineHeight } from '@/theme';

type Props = {
  surtitre: string;
  titre: string;
  onPress?: () => void;
};

export function SectionHeader({ surtitre, titre, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'header'}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.surtitreRow}>
        <Text style={styles.surtitre}>{surtitre}</Text>
        {/* Boîte 5×8 du design ; l'asset (6,5×9,5) déborde du trait comme dans Figma */}
        <View style={styles.chevronBox}>
          <Image
            source={require('../../assets/icons/chevron-right.svg')}
            style={styles.chevron}
            contentFit="contain"
            tintColor={colors.surtitre}
          />
        </View>
      </View>
      <Text style={styles.titre}>{titre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    alignSelf: 'stretch',
  },
  surtitreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  surtitre: {
    fontFamily: fonts.interExtraBold,
    fontSize: 9,
    lineHeight: normalLineHeight(9),
    letterSpacing: 1.5,
    color: colors.surtitre,
  },
  chevronBox: {
    width: 5,
    height: 8,
  },
  chevron: {
    position: 'absolute',
    left: -0.75,
    top: -0.75,
    width: 6.5,
    height: 9.5,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 23,
    lineHeight: 23 * 1.1,
    color: colors.textPrimaryAlt,
  },
});
