import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { useSourcePhoto } from '@/hooks/useSourcePhoto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  titre: string;
  photoUri?: string;
  miniature?: string;
  date: string;
  themes: string[];
  onPress?: () => void;
};

// « Carte prouesse » de la timeline Chroniques : titre, photo, date de validation, thèmes
export function CarteSouvenir({ titre, photoUri, miniature, date, themes, onPress }: Props) {
  const { source, onError } = useSourcePhoto(photoUri, miniature);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titre}, validée le ${date}`}
      style={({ pressed }) => [styles.carte, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.titre} numberOfLines={1}>
        {titre}
      </Text>
      <View style={styles.photo}>
        {source ? (
          <Image source={{ uri: source }} style={StyleSheet.absoluteFill} contentFit="cover" onError={onError} />
        ) : (
          <Text style={styles.texteSecondaire}>Photo de la prouesse</Text>
        )}
      </View>
      <Text style={styles.texteSecondaire}>{date}</Text>
      {themes.length ? (
        <View style={styles.themes}>
          {themes.map((theme) => (
            <Chip key={theme} libelle={theme} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    gap: 12,
    padding: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimaryAlt,
  },
  photo: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surfacePhoto,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
  },
  texteSecondaire: {
    fontFamily: fonts.interRegular,
    fontSize: 11,
    lineHeight: normalLineHeight(11),
    color: colors.textNavInactive,
  },
  themes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
