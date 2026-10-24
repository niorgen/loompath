import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { DegradeAccent } from '@/components/Fonds';
import { ListRow } from '@/components/ListRow';
import { Picto, pictoDe } from '@/components/Picto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  titre: string;
  obtenues: number;
  total: number;
  onPress?: () => void;
};

// Ligne du carnet : picto de la catégorie (étincelles à défaut), nom + jauge des prouesses obtenues
export function ProgressionRow({ titre, obtenues, total, onPress }: Props) {
  const ratio = total > 0 ? Math.min(obtenues / total, 1) : 0;
  const niveau = `Prouesses ${obtenues} sur ${total}`;

  return (
    <ListRow
      onPress={onPress}
      icone={pictoDe(titre) ? <Picto nom={titre} taille={18} /> : undefined}
      accessibilityLabel={`${titre}, ${niveau}`}
      trailing={
        <Image
          source={require('../../assets/icons/chevron-right-16.svg')}
          style={styles.chevron}
          contentFit="contain"
        />
      }
    >
      <Text style={styles.titre} numberOfLines={1}>
        {titre}
      </Text>
      <View style={styles.progression}>
        <View
          style={styles.jauge}
          accessibilityRole="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={obtenues}
        >
          <View style={[styles.atteinte, { width: `${ratio * 100}%` }]}>
            <DegradeAccent />
          </View>
        </View>
        <Text style={styles.niveau}>{niveau}</Text>
      </View>
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
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
  niveau: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
  chevron: {
    width: 16,
    height: 16,
  },
});
