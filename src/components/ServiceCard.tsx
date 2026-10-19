import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  badge: string;
  nom: string;
  photo?: string;
  onPress?: () => void;
};

export function ServiceCard({ badge, nom, photo, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${badge} : ${nom}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText} numberOfLines={1}>
          {badge}
        </Text>
      </View>
      <View style={styles.photo}>
        {photo ? (
          <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Image
            source={require('../../assets/icons/image.svg')}
            style={styles.placeholderIcon}
            contentFit="contain"
          />
        )}
      </View>
      <View style={styles.libelles}>
        <Text style={styles.nom} numberOfLines={2}>
          {nom}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 114,
    // Hauteur minimale : le carrousel aligne toutes les cartes sur la plus haute (titre sur 2 lignes)
    minHeight: 132,
    padding: 8,
    gap: 8,
    overflow: 'hidden',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 0.7,
    borderColor: colors.borderCard,
    borderRadius: radius.md,
  },
  badge: {
    maxWidth: '100%',
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 0.5,
    borderColor: colors.borderCard,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontFamily: fonts.interBold,
    fontSize: 8,
    lineHeight: normalLineHeight(8),
    color: colors.accentSecondary,
  },
  photo: {
    alignSelf: 'stretch',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surfacePlaceholder,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.sm,
  },
  placeholderIcon: {
    width: 24,
    height: 24,
  },
  libelles: {
    alignSelf: 'stretch',
    paddingBottom: 8,
  },
  nom: {
    fontFamily: fonts.loraBold,
    fontSize: 12,
    lineHeight: 14,
    color: colors.textPrimaryAlt,
  },
});
