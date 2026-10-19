import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { SegmentedControl } from '@/components/SegmentedControl';
import { colors, radius } from '@/theme';

type Props<T extends string> = {
  segments: { valeur: T; libelle: string }[];
  vue: T;
  onChangeVue: (vue: T) => void;
  onRechercher: () => void;
  filtreActif: boolean;
  onFiltrer: () => void;
  libelleFiltre: string;
};

// « Header compact » du design (Cartes, Chroniques) : recherche, choix de vue, filtre
export function BarreOutils<T extends string>({
  segments,
  vue,
  onChangeVue,
  onRechercher,
  filtreActif,
  onFiltrer,
  libelleFiltre,
}: Props<T>) {
  return (
    <View style={styles.barre}>
      <Pressable
        onPress={onRechercher}
        accessibilityRole="button"
        accessibilityLabel="Rechercher une prouesse"
        style={({ pressed }) => [styles.boutonRond, pressed && { opacity: 0.7 }]}
      >
        <Image source={require('../../assets/icons/search-bold.svg')} style={styles.icone} contentFit="contain" />
      </Pressable>

      <SegmentedControl<T> segments={segments} valeur={vue} onChange={onChangeVue} />

      <Pressable
        onPress={onFiltrer}
        accessibilityRole="switch"
        accessibilityLabel={libelleFiltre}
        accessibilityState={{ checked: filtreActif }}
        style={({ pressed }) => [styles.boutonRond, filtreActif && styles.boutonActif, pressed && { opacity: 0.7 }]}
      >
        <Image
          source={require('../../assets/icons/filter-sliders.svg')}
          style={styles.icone}
          contentFit="contain"
          tintColor={filtreActif ? colors.textOnLight : undefined}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  barre: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boutonRond: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  boutonActif: {
    backgroundColor: colors.accentSecondary,
  },
  icone: {
    width: 32,
    height: 32,
  },
});
