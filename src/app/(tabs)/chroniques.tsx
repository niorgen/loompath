import { router, useNavigation } from 'expo-router';
import type { BottomTabNavigationProp } from 'expo-router/tabs';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarreOutils } from '@/components/BarreOutils';
import { CarteSouvenir } from '@/components/CarteSouvenir';
import { Chip } from '@/components/Chip';
import { HeaderTitle } from '@/components/HeaderTitle';
import { IndiceRow } from '@/components/IndiceRow';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { construireChroniques, formatDateValidation, themesDe, type Prouesse } from '@/data';
import { useProuesses } from '@/state/validations';
import { colors, fonts } from '@/theme';

type Vue = 'timeline' | 'liste';

const ouvrir = (prouesse: Prouesse) => router.push(`/prouesse/${prouesse.id}`);

export default function ChroniquesScreen() {
  const insets = useSafeAreaInsets();
  const prouesses = useProuesses();
  const [vue, setVue] = useState<Vue>('timeline');
  // Filtre par parc : la rangée de parcs s'affiche quand le filtre est ouvert
  const [filtreOuvert, setFiltreOuvert] = useState(false);
  const [parc, setParc] = useState<string>();

  // Un appui sur l'onglet Chroniques dans la barre du bas ramène à la timeline
  const navigation = useNavigation<BottomTabNavigationProp<Record<string, undefined>>>();
  useEffect(() => navigation.addListener('tabPress', () => setVue('timeline')), [navigation]);

  const validees = useMemo(() => prouesses.filter((p) => p.obtenue), [prouesses]);
  const parcs = useMemo(() => [...new Set(validees.map((p) => p.parc))].sort((a, b) => a.localeCompare(b, 'fr')), [validees]);
  const filtrees = useMemo(() => (parc ? validees.filter((p) => p.parc === parc) : validees), [validees, parc]);
  const periodes = useMemo(() => construireChroniques(filtrees), [filtrees]);
  // Vue liste : toutes les prouesses validées, de la plus récente à la plus ancienne
  const liste = useMemo(() => periodes.flatMap((p) => p.prouesses), [periodes]);

  const entete = (
    <View style={[styles.entete, { paddingTop: insets.top + 18 }]}>
      <BarreOutils<Vue>
        segments={[
          { valeur: 'timeline', libelle: 'Timeline' },
          { valeur: 'liste', libelle: 'Liste' },
        ]}
        vue={vue}
        onChangeVue={setVue}
        onRechercher={() => router.navigate('/prouesses')}
        filtreActif={filtreOuvert || !!parc}
        onFiltrer={() => setFiltreOuvert((ouvert) => !ouvert)}
        libelleFiltre="Filtrer par parc"
      />
      <HeaderTitle surtitre="Carnet de souvenirs" titre="Chroniques" sousTitre="Retrouvez vos prouesses validées" />
      {filtreOuvert && parcs.length ? (
        <View style={styles.filtres}>
          <Chip libelle="Tous les parcs" actif={!parc} onPress={() => setParc(undefined)} />
          {parcs.map((nom) => (
            <Chip key={nom} libelle={nom} actif={parc === nom} onPress={() => setParc(nom)} />
          ))}
        </View>
      ) : null}
      <View style={styles.filet} />
    </View>
  );

  const vide = (
    <Text style={styles.vide}>
      {validees.length
        ? 'Aucune prouesse validée dans ce parc.'
        : 'Aucune prouesse validée pour l’instant. Photographiez une prouesse pour la retrouver ici.'}
    </Text>
  );

  const fin = filtrees.length ? <Text style={styles.fin}>Chaque prouesse laisse une trace.</Text> : null;
  const contenu = [styles.contenu, { paddingBottom: NAV_HEIGHT + insets.bottom + 32 }];

  return (
    <View style={styles.screen}>
      {vue === 'timeline' ? (
        <FlatList
          data={periodes}
          keyExtractor={(periode) => periode.id}
          renderItem={({ item: periode }) => (
            <View style={styles.periode}>
              <View style={styles.repere}>
                <Text style={styles.titrePeriode}>{periode.titre}</Text>
                <Text style={styles.mois}>{periode.mois}</Text>
              </View>
              <View style={styles.cartes}>
                {periode.prouesses.map((prouesse) => (
                  <CarteSouvenir
                    key={prouesse.id}
                    titre={prouesse.titre}
                    photoUri={prouesse.photoUri}
                    miniature={prouesse.miniature}
                    date={formatDateValidation(prouesse.dateValidation!)}
                    themes={themesDe(prouesse)}
                    onPress={() => ouvrir(prouesse)}
                  />
                ))}
              </View>
            </View>
          )}
          ListHeaderComponent={entete}
          ListEmptyComponent={vide}
          ListFooterComponent={fin}
          contentContainerStyle={contenu}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={liste}
          keyExtractor={(prouesse) => prouesse.id}
          renderItem={({ item: prouesse }) => (
            <IndiceRow
              titre={prouesse.titre}
              indice={`${formatDateValidation(prouesse.dateValidation!)} · ${prouesse.land ?? prouesse.parc}`}
              obtenue
              onPress={() => ouvrir(prouesse)}
            />
          )}
          ListHeaderComponent={entete}
          ListEmptyComponent={vide}
          ListFooterComponent={fin}
          contentContainerStyle={[contenu, styles.contenuListe]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenu: {
    paddingHorizontal: 20,
    gap: 24,
  },
  contenuListe: {
    gap: 8,
  },
  entete: {
    gap: 20,
  },
  filtres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filet: {
    height: 1,
    backgroundColor: colors.divider,
  },
  periode: {
    gap: 14,
  },
  repere: {
    gap: 2,
  },
  titrePeriode: {
    fontFamily: fonts.loraBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimaryAlt,
  },
  mois: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textNavInactive,
  },
  cartes: {
    gap: 12,
  },
  fin: {
    paddingTop: 8,
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textNavInactive,
  },
  vide: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
