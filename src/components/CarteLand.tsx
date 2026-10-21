import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Picto, pictoDe } from '@/components/Picto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  nom: string;
  obtenues: number;
  total: number;
  onPress?: () => void;
};

// Carte « Service » de la grille des lands : nom, picto du tag (sablier à défaut, badge si terminé), jauge, « Consulter »
export function CarteLand({ nom, obtenues, total, onPress }: Props) {
  const ratio = total > 0 ? Math.min(obtenues / total, 1) : 0;
  const niveau = `Prouesses ${obtenues} sur ${total}`;
  const termine = total > 0 && obtenues >= total;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${nom}, ${niveau}`}
      style={({ pressed }) => [styles.carte, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.entete}>
        <Text style={styles.nom} numberOfLines={2}>
          {nom}
        </Text>
        {termine || !pictoDe(nom) ? (
          <Image
            source={
              termine
                ? require('../../assets/icons/badge-validation.svg')
                : require('../../assets/icons/hourglass.svg')
            }
            style={styles.icone}
            contentFit="contain"
          />
        ) : (
          <Picto nom={nom} />
        )}
      </View>
      <View style={styles.progression}>
        <View style={styles.jauge} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: obtenues }}>
          <View style={[styles.atteinte, { width: `${ratio * 100}%` }]} />
        </View>
        <Text style={styles.niveau}>{niveau}</Text>
      </View>
      <View style={styles.action}>
        <Text style={styles.consulter}>Consulter</Text>
        <Image
          source={require('../../assets/icons/arrow-right.svg')}
          style={styles.icone}
          contentFit="contain"
          tintColor={colors.accent}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    flex: 1,
    gap: 12,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 0.7,
    borderColor: colors.borderCard,
    borderRadius: radius.md,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nom: {
    flex: 1,
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textPrimaryAlt,
  },
  icone: {
    width: 16,
    height: 16,
  },
  progression: {
    gap: 4,
  },
  jauge: {
    height: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.21)',
    borderRadius: radius.pill,
  },
  atteinte: {
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
  niveau: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consulter: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: 14,
    color: colors.accent,
  },
});
