import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, normalLineHeight, radius, shadows } from '@/theme';

export type Destination = 'journal' | 'prouesse' | 'cartes' | 'chroniques' | 'profil';

const DESTINATIONS: { key: Destination; label: string; icon: ImageSource; size: number }[] = [
  { key: 'journal', label: 'Journal', icon: require('../../assets/icons/nav-journal.svg'), size: 17 },
  { key: 'prouesse', label: 'Prouesse', icon: require('../../assets/icons/nav-prouesse.svg'), size: 20 },
  { key: 'cartes', label: 'Cartes', icon: require('../../assets/icons/nav-cartes.svg'), size: 17 },
  { key: 'chroniques', label: 'Chroniques', icon: require('../../assets/icons/nav-chroniques.svg'), size: 17 },
  { key: 'profil', label: 'Profil', icon: require('../../assets/icons/nav-profil.svg'), size: 17 },
];

// Hauteur de la zone de navigation flottante (capsule 64 + marges 16×2)
export const NAV_HEIGHT = 96;

type Props = {
  actif: Destination;
  onSelect?: (destination: Destination) => void;
};

export function NavigationMenu({ actif, onSelect }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingBottom: 16 + insets.bottom }]}>
      <View style={styles.surface} accessibilityRole="tablist">
        {DESTINATIONS.map(({ key, label, icon, size }) => {
          const selected = key === actif;
          return (
            <Pressable
              key={key}
              onPress={() => onSelect?.(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
              style={styles.destination}
            >
              <View style={[styles.iconPill, selected && styles.iconPillActive]}>
                <Image
                  source={icon}
                  style={{ width: size, height: size }}
                  contentFit="contain"
                  // Les assets sont exportés dans l'état du design (Journal actif) ;
                  // la teinte suit l'état réel de la destination.
                  tintColor={selected ? colors.textOnLight : colors.textNavInactive}
                />
              </View>
              <Text style={[styles.label, selected && styles.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  surface: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderNav,
    borderRadius: 22,
    boxShadow: shadows.nav,
  },
  destination: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  iconPill: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  iconPillActive: {
    backgroundColor: colors.accentSecondary,
  },
  label: {
    fontFamily: fonts.interRegular,
    fontSize: 9,
    lineHeight: normalLineHeight(9),
    color: colors.textNavInactive,
  },
  labelActive: {
    fontFamily: fonts.interExtraBold,
    color: colors.textPrimaryAlt,
  },
});
