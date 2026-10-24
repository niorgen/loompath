import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarteLeaflet } from '@/components/carte/CarteLeaflet';
import type { DonneesCarte, MessageCarte } from '@/components/carte/carteHtml';
import { Degrade } from '@/components/Degrade';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { estLocalisee } from '@/data';
import { useTitrePage } from '@/hooks/useTitrePage';
import { useProuesses } from '@/state/validations';
import { colors } from '@/theme';

export default function CartesScreen() {
  useTitrePage('Cartes');
  const insets = useSafeAreaInsets();
  const prouesses = useProuesses();
  // « Voir sur la carte » après une validation : plan centré sur la prouesse
  const { focus } = useLocalSearchParams<{ focus?: string }>();

  // Seules les prouesses validées et géolocalisées apparaissent sur le plan
  const donnees = useMemo<DonneesCarte>(() => {
    const localisees = prouesses.filter((p) => p.obtenue).filter(estLocalisee);
    const cible = focus ? localisees.find((p) => p.id === focus) : undefined;
    return {
      centre: cible ? { id: cible.id, latitude: cible.latitude, longitude: cible.longitude } : undefined,
      points: localisees.map((p) => ({
        id: p.id,
        titre: p.titre,
        latitude: p.latitude,
        longitude: p.longitude,
        obtenue: p.obtenue,
      })),
      photos: localisees.flatMap((p) =>
        p.miniature
          ? [{ id: p.id, titre: p.titre, latitude: p.latitude, longitude: p.longitude, miniature: p.miniature }]
          : [],
      ),
    };
  }, [prouesses, focus]);

  const ouvrir = useCallback((message: MessageCarte) => {
    if (message.type === 'prouesse') router.push(`/prouesse/${message.id}`);
  }, []);

  return (
    <View style={styles.screen}>
      <View style={StyleSheet.absoluteFill}>
        <CarteLeaflet donnees={donnees} margeBas={NAV_HEIGHT + insets.bottom} onMessage={ouvrir} />
      </View>
      <Degrade de={0.8} a={0} style={[styles.degradeHaut, { height: insets.top + 44 }]} />
      <Degrade de={0} a={0.8} style={styles.degradeBas} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  degradeHaut: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  degradeBas: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
});
