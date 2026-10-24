import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { useSourcePhoto } from '@/hooks/useSourcePhoto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  titre: string;
  photoUri?: string;
  miniature?: string;
  /** Heure de validation, ex. « 14:32 » */
  heure: string;
  /** Libellé complet pour l'accessibilité, ex. « 20 octobre 2026 » */
  date: string;
  /** Type de la prouesse (chip pleine), suivi des thèmes (chips bordées) */
  type?: string;
  themes: string[];
  /** Grande carte : premier souvenir d'une journée ; petite : grille à deux colonnes */
  taille: 'grande' | 'petite';
  onPress?: () => void;
};

// « Carte souvenir » de la frise Chroniques : photo avec l'heure, titre, type et thèmes
export function CarteSouvenir({ titre, photoUri, miniature, heure, date, type, themes, taille, onPress }: Props) {
  const { source, onError } = useSourcePhoto(photoUri, miniature);
  const grande = taille === 'grande';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titre}, validée le ${date} à ${heure}`}
      style={({ pressed }) => [styles.carte, !grande && styles.cartePetite, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.photo, { height: grande ? 340 : 180 }]}>
        {source ? (
          <Image source={{ uri: source }} style={StyleSheet.absoluteFill} contentFit="cover" onError={onError} />
        ) : (
          <View style={styles.vide}>
            <Image
              source={require('../../assets/icons/image.svg')}
              style={grande ? styles.iconeGrande : styles.iconePetite}
              contentFit="contain"
              tintColor={colors.textSecondary}
            />
            {grande ? <Text style={styles.libelleVide}>Photo de la prouesse</Text> : null}
          </View>
        )}
        <View style={styles.heure}>
          <Text style={[styles.texteHeure, !grande && styles.texteHeurePetit]}>{heure}</Text>
        </View>
      </View>

      <View style={[styles.infos, !grande && styles.infosPetites]}>
        <Text style={grande ? styles.titre : styles.titrePetit} numberOfLines={grande ? 1 : 2}>
          {titre}
        </Text>
        {type || themes.length ? (
          <View style={[styles.themes, !grande && styles.themesPetits]}>
            {type ? <Chip libelle={type} actif /> : null}
            {themes.map((theme) => (
              <Chip key={theme} libelle={theme} />
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
  },
  cartePetite: {
    flex: 1,
  },
  photo: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surfacePlaceholder,
  },
  vide: {
    alignItems: 'center',
    gap: 8,
  },
  iconeGrande: {
    width: 32,
    height: 32,
  },
  iconePetite: {
    width: 26,
    height: 26,
  },
  libelleVide: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textSecondary,
  },
  heure: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(5,8,22,0.72)',
    borderRadius: radius.pill,
  },
  texteHeure: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textPrimary,
  },
  texteHeurePetit: {
    fontSize: 11,
    lineHeight: normalLineHeight(11),
  },
  infos: {
    gap: 10,
    padding: 16,
  },
  infosPetites: {
    gap: 6,
    padding: 12,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimaryAlt,
  },
  titrePetit: {
    fontFamily: fonts.loraBold,
    fontSize: 15,
    lineHeight: 19,
    color: colors.textPrimaryAlt,
  },
  themes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themesPetits: {
    gap: 6,
  },
});
