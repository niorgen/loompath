import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type Props = {
  children: ReactNode;
  trailing?: ReactNode;
  /** Remplace les étincelles du repère (ex. picto de la catégorie) */
  icone?: ReactNode;
  accessibilityLabel?: string;
  onPress?: () => void;
};

// « Row/List » du design : repère étincelles + contenu + élément de fin
export function ListRow({ children, trailing, icone, accessibilityLabel, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.repere}>
        {icone ?? (
          <Image
            source={require('../../assets/icons/sparkles.svg')}
            style={styles.sparkles}
            contentFit="contain"
          />
        )}
      </View>
      <View style={styles.contenu}>{children}</View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: colors.surfaceRow,
    borderRadius: radius.md,
  },
  repere: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
  },
  sparkles: {
    width: 18,
    height: 18,
  },
  contenu: {
    flex: 1,
    gap: 4,
  },
});
