import { router, useNavigation } from 'expo-router';
import type { BottomTabNavigationProp } from 'expo-router/tabs';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarreOutils } from '@/components/BarreOutils';
import { CarteSouvenir } from '@/components/CarteSouvenir';
import { Chip } from '@/components/Chip';
import { HeaderTitle } from '@/components/HeaderTitle';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ResumeMois } from '@/components/ResumeMois';
import {
  compterSouvenirs,
  compterVisites,
  construireChroniques,
  formatDateValidation,
  formatHeureValidation,
  TYPE_LABELS,
  type EtapeChroniques,
  type Prouesse,
} from '@/data';
import { useProuesses } from '@/state/validations';
import { colors, fonts, normalLineHeight } from '@/theme';

type Vue = 'timeline' | 'grille';

const ouvrir = (prouesse: Prouesse) => router.push(`/prouesse/${prouesse.id}`);

function Souvenir({ prouesse, taille }: { prouesse: Prouesse; taille: 'grande' | 'petite' }) {
  const type = prouesse.type && TYPE_LABELS[prouesse.type].singulier;
  // Sur la grande carte, le type est en tête ; le lieu et les thèmes du CSV suivent
  const themes = [...new Set([prouesse.land ?? prouesse.parc, ...(prouesse.themes ?? [])])].filter((t) => t !== type);
  return (
    <CarteSouvenir
      titre={prouesse.titre}
      photoUri={prouesse.photoUri}
      miniature={prouesse.miniature}
      heure={formatHeureValidation(prouesse.dateValidation!)}
      date={formatDateValidation(prouesse.dateValidation!)}
      type={type}
      themes={themes}
      taille={taille}
      onPress={() => ouvrir(prouesse)}
    />
  );
}

// Premier souvenir en grande carte, les suivants deux par deux
function SouvenirsDuJour({ prouesses }: { prouesses: Prouesse[] }) {
  const [premiere, ...suivantes] = prouesses;
  const paires = Array.from({ length: Math.ceil(suivantes.length / 2) }, (_, i) => suivantes.slice(i * 2, i * 2 + 2));
  return (
    <View style={styles.cartes}>
      <Souvenir prouesse={premiere} taille="grande" />
      {paires.map((paire) => (
        <View key={paire[0].id} style={styles.paire}>
          {paire.map((prouesse) => (
            <Souvenir key={prouesse.id} prouesse={prouesse} taille="petite" />
          ))}
          {paire.length === 1 ? <View style={styles.caseVide} /> : null}
        </View>
      ))}
    </View>
  );
}

export default function ChroniquesScreen() {
  const insets = useSafeAreaInsets();
  const prouesses = useProuesses();
  const [vue, setVue] = useState<Vue>('timeline');
  // Filtre par parc : la rangée de parcs s'affiche quand le filtre est ouvert
  const [filtreOuvert, setFiltreOuvert] = useState(false);
  const [parc, setParc] = useState<string>();
  // Mois passés dépliés via « Voir le mois »
  const [moisOuverts, setMoisOuverts] = useState<string[]>([]);

  // Un appui sur l'onglet Chroniques dans la barre du bas ramène à la timeline
  const navigation = useNavigation<BottomTabNavigationProp<Record<string, undefined>>>();
  useEffect(() => navigation.addListener('tabPress', () => setVue('timeline')), [navigation]);

  const validees = useMemo(() => prouesses.filter((p) => p.obtenue), [prouesses]);
  const parcs = useMemo(() => [...new Set(validees.map((p) => p.parc))].sort((a, b) => a.localeCompare(b, 'fr')), [validees]);
  const filtrees = useMemo(() => (parc ? validees.filter((p) => p.parc === parc) : validees), [validees, parc]);
  const etapes = useMemo(() => construireChroniques(filtrees), [filtrees]);
  // Vue grille : toutes les prouesses validées, de la plus récente à la plus ancienne
  const grille = useMemo(() => etapes.flatMap((e) => e.prouesses), [etapes]);

  const visites = compterVisites(filtrees);
  const sousTitre = `${compterSouvenirs(filtrees.length)} · ${visites} visite${visites > 1 ? 's' : ''} au parc`;

  const entete = (
    <View style={[styles.entete, { paddingTop: insets.top + 18 }]}>
      <BarreOutils<Vue>
        segments={[
          { valeur: 'timeline', libelle: 'Timeline' },
          { valeur: 'grille', libelle: 'Grille' },
        ]}
        vue={vue}
        onChangeVue={setVue}
        onRechercher={() => router.navigate('/prouesses')}
        filtreActif={filtreOuvert || !!parc}
        onFiltrer={() => setFiltreOuvert((ouvert) => !ouvert)}
        libelleFiltre="Filtrer par parc"
      />
      <HeaderTitle surtitre="Carnet de souvenirs" titre="Chroniques" sousTitre={sousTitre} />
      {filtreOuvert && parcs.length ? (
        <View style={styles.filtres}>
          <Chip libelle="Tous les parcs" actif={!parc} onPress={() => setParc(undefined)} />
          {parcs.map((nom) => (
            <Chip key={nom} libelle={nom} actif={parc === nom} onPress={() => setParc(nom)} />
          ))}
        </View>
      ) : null}
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

  const renderEtape = ({ item: etape }: { item: EtapeChroniques }) => {
    const replie = etape.resume && !moisOuverts.includes(etape.id);
    return (
      <View style={styles.etape}>
        <View style={styles.titreEtape}>
          <Text style={styles.titre} accessibilityRole="header">
            {etape.titre}
          </Text>
          <Text style={styles.meta}>{etape.meta}</Text>
        </View>
        {replie ? (
          <ResumeMois prouesses={etape.prouesses} onPress={() => setMoisOuverts((ouverts) => [...ouverts, etape.id])} />
        ) : (
          <SouvenirsDuJour prouesses={etape.prouesses} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {vue === 'timeline' ? (
        <FlatList
          data={etapes}
          keyExtractor={(etape) => etape.id}
          renderItem={renderEtape}
          ListHeaderComponent={entete}
          ListEmptyComponent={vide}
          ListFooterComponent={fin}
          contentContainerStyle={contenu}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="grille"
          data={grille}
          numColumns={2}
          keyExtractor={(prouesse) => prouesse.id}
          renderItem={({ item: prouesse }) => <Souvenir prouesse={prouesse} taille="petite" />}
          ListHeaderComponent={entete}
          ListEmptyComponent={vide}
          ListFooterComponent={fin}
          contentContainerStyle={[contenu, styles.contenuGrille]}
          columnWrapperStyle={styles.paire}
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
  },
  contenuGrille: {
    gap: 10,
  },
  entete: {
    gap: 20,
    paddingBottom: 28,
  },
  filtres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  etape: {
    gap: 16,
    paddingBottom: 32,
  },
  titreEtape: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  titre: {
    flexShrink: 1,
    fontFamily: fonts.loraBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimaryAlt,
  },
  meta: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textSecondary,
  },
  cartes: {
    gap: 12,
  },
  paire: {
    flexDirection: 'row',
    gap: 10,
  },
  caseVide: {
    flex: 1,
  },
  fin: {
    paddingTop: 8,
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textNavInactive,
    textAlign: 'center',
  },
  vide: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
