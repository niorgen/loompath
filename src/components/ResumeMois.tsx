import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Prouesse } from '@/data';
import { useSourcePhoto } from '@/hooks/useSourcePhoto';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

type Props = {
  prouesses: Prouesse[];
  onPress: () => void;
};

const VIGNETTES_MAX = 3;

// Aperçu d'un mois passé dans la frise Chroniques : trois vignettes (ou deux et « +N »), puis « Voir le mois »
export function ResumeMois({ prouesses, onPress }: Props) {
  const reste = prouesses.length > VIGNETTES_MAX ? prouesses.length - (VIGNETTES_MAX - 1) : 0;
  const visibles = prouesses.slice(0, reste ? VIGNETTES_MAX - 1 : VIGNETTES_MAX);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Voir le mois"
      style={({ pressed }) => [styles.carte, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.vignettes}>
        {visibles.map((prouesse) => (
          <Vignette key={prouesse.id} prouesse={prouesse} />
        ))}
        {reste ? (
          <View style={styles.vignette}>
            <Text style={styles.reste}>+{reste}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.lien}>
        <Text style={styles.texteLien}>Voir le mois</Text>
        <Image
          source={require('../../assets/icons/arrow-right.svg')}
          style={styles.fleche}
          contentFit="contain"
          tintColor={colors.accent}
        />
      </View>
    </Pressable>
  );
}

function Vignette({ prouesse }: { prouesse: Prouesse }) {
  const { source, onError } = useSourcePhoto(prouesse.photoUri, prouesse.miniature);
  return (
    <View style={styles.vignette}>
      {source ? (
        <Image source={{ uri: source }} style={StyleSheet.absoluteFill} contentFit="cover" onError={onError} />
      ) : (
        <Image
          source={require('../../assets/icons/image.svg')}
          style={styles.icone}
          contentFit="contain"
          tintColor={colors.textSecondary}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    gap: 14,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
  },
  vignettes: {
    flexDirection: 'row',
    gap: 6,
  },
  vignette: {
    flex: 1,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surfacePlaceholder,
    borderRadius: radius.sm,
  },
  icone: {
    width: 20,
    height: 20,
  },
  reste: {
    fontFamily: fonts.interBold,
    fontSize: 15,
    lineHeight: normalLineHeight(15),
    color: colors.textPrimary,
  },
  lien: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  texteLien: {
    fontFamily: fonts.interBold,
    fontSize: 14,
    lineHeight: normalLineHeight(14),
    color: colors.accent,
  },
  fleche: {
    width: 16,
    height: 16,
  },
});
