import { Image } from 'expo-image';
import { router, useNavigation } from 'expo-router';
import type { BottomTabNavigationProp } from 'expo-router/tabs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CarteLeaflet } from '@/components/carte/CarteLeaflet';
import type { DonneesCarte, MessageCarte } from '@/components/carte/carteHtml';
import { Degrade } from '@/components/Degrade';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ProgressionRow } from '@/components/ProgressionRow';
import { SegmentedControl } from '@/components/SegmentedControl';
import { estLocalisee } from '@/data';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors, radius } from '@/theme';

type Vue = 'plan' | 'liste';

export default function CartesScreen() {
  const insets = useSafeAreaInsets();
  const prouesses = useProuesses();
  const carnet = useCarnet();
  const [vue, setVue] = useState<Vue>('plan');
  // Filtre : n'afficher que les prouesses (et catégories) où le joueur a des photos
  const [photosSeulement, setPhotosSeulement] = useState(false);

  // Un appui sur l'onglet Cartes dans la barre du bas ramène au plan
  const navigation = useNavigation<BottomTabNavigationProp<Record<string, undefined>>>();
  useEffect(() => navigation.addListener('tabPress', () => setVue('plan')), [navigation]);

  const categoriesVisibles = useMemo(
    () => (photosSeulement ? carnet.filter((c) => c.prouesses.some((p) => p.miniature)) : carnet),
    [carnet, photosSeulement],
  );

  // Seules les prouesses validées et géolocalisées apparaissent sur le plan
  const donnees = useMemo<DonneesCarte>(() => {
    const localisees = prouesses
      .filter((p) => p.obtenue)
      .filter(estLocalisee)
      .filter((p) => !photosSeulement || p.miniature);
    return {
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
  }, [prouesses, photosSeulement]);

  const ouvrir = useCallback((message: MessageCarte) => {
    router.push(`/prouesse/${message.id}`);
  }, []);

  const hautEntete = insets.top + 48;
  const margeBas = NAV_HEIGHT + insets.bottom;

  return (
    <View style={styles.screen}>
      {vue === 'plan' ? (
        <>
          <View style={StyleSheet.absoluteFill}>
            <CarteLeaflet donnees={donnees} margeBas={margeBas} onMessage={ouvrir} />
          </View>
          <Degrade de={0.8} a={0} style={[styles.degradeHaut, { height: insets.top + 44 }]} />
          <Degrade de={0} a={0.8} style={styles.degradeBas} />
        </>
      ) : (
        <FlatList
          data={categoriesVisibles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProgressionRow
              titre={item.nom}
              obtenues={item.obtenues}
              total={item.total}
              onPress={() => router.push(`/prouesses/${item.id}`)}
            />
          )}
          contentContainerStyle={[
            styles.liste,
            { paddingTop: hautEntete + 16, paddingBottom: margeBas + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={[styles.entete, { top: insets.top }]}>
        <Pressable
          onPress={() => router.navigate('/prouesses')}
          accessibilityRole="button"
          accessibilityLabel="Rechercher une prouesse"
          style={({ pressed }) => [styles.boutonRond, pressed && { opacity: 0.7 }]}
        >
          <Image source={require('../../../assets/icons/search-bold.svg')} style={styles.icone} contentFit="contain" />
        </Pressable>

        <SegmentedControl<Vue>
          segments={[
            { valeur: 'plan', libelle: 'Plan' },
            { valeur: 'liste', libelle: 'Liste' },
          ]}
          valeur={vue}
          onChange={setVue}
        />

        <Pressable
          onPress={() => setPhotosSeulement((actif) => !actif)}
          accessibilityRole="switch"
          accessibilityLabel="Afficher uniquement les prouesses avec photos"
          accessibilityState={{ checked: photosSeulement }}
          style={({ pressed }) => [
            styles.boutonRond,
            photosSeulement && styles.boutonActif,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Image
            source={require('../../../assets/icons/filter-sliders.svg')}
            style={styles.icone}
            contentFit="contain"
            tintColor={photosSeulement ? colors.textOnLight : undefined}
          />
        </Pressable>
      </View>
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
  entete: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  liste: {
    paddingHorizontal: 16,
    gap: 8,
  },
});
