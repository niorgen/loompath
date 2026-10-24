import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DetailHeader } from '@/components/DetailHeader';
import { GrilleCategories } from '@/components/GrilleCategories';
import { IndiceRow } from '@/components/IndiceRow';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ProgressionGlobale } from '@/components/ProgressionGlobale';
import { ProgressionRow } from '@/components/ProgressionRow';
import { ResultatsProuesses } from '@/components/ResultatsProuesses';
import { SearchField } from '@/components/SearchField';
import {
  construireCarnet,
  estResort,
  prouessesSource,
  rechercherCarnet,
  rechercherProuesses,
  TYPE_LABELS,
  type Categorie,
  type Prouesse,
  type TypeProuesse,
} from '@/data';
import { useTitrePage } from '@/hooks/useTitrePage';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function DetailProuessesScreen() {
  const insets = useSafeAreaInsets();
  // parc / land : identifiant du parc ou du land qui limite la catégorie (ex. les Secrets d'un seul parc,
  // ouverts depuis sa page, ou ceux du land où se trouve le joueur, ouverts depuis le Journal)
  const { id, parc: parcId, land: landId } = useLocalSearchParams<{ id: string; parc?: string; land?: string }>();
  const prouesses = useProuesses();
  const carnet = useCarnet();
  const parc = parcId ? carnet.find((c) => c.id === parcId && c.niveau === 'parc') : undefined;
  const land = landId ? carnet.find((c) => c.id === landId && c.niveau === 'land') : undefined;
  const categories = useMemo(
    () =>
      parc
        ? construireCarnet(prouesses.filter((p) => p.parc === parc.nom))
        : land
          ? construireCarnet(prouesses.filter((p) => p.land === land.nom))
          : carnet,
    [parc, land, prouesses, carnet],
  );
  const detail = categories.find((c) => c.id === id);
  useTitrePage(detail?.nom ?? 'Prouesses');
  const [recherche, setRecherche] = useState('');
  const trouvees = useMemo(() => rechercherProuesses(detail?.prouesses ?? [], recherche), [detail, recherche]);

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/prouesses'));

  const ariane = (nomParc: string) => `${estResort(nomParc) ? 'Resort' : 'Parcs'} / ${nomParc}`;

  // Fil d'Ariane : « Prouesses » pour un parc, « Parcs / <parc> » pour un land ou un type du parc,
  // « Catégories » pour un type tous parcs confondus
  const chemin = !detail
    ? 'Prouesses'
    : detail.niveau === 'parc'
      ? 'Prouesses'
      : detail.niveau === 'land'
        ? ariane(detail.prouesses[0]?.parc ?? '')
        : parc
          ? ariane(parc.nom)
          : land
            ? `${ariane(land.prouesses[0]?.parc ?? '')} / ${land.nom}`
            : 'Catégories';

  // En-tête et jauge forment un seul bloc dans le design
  const entete = (
    <View>
      <DetailHeader surtitre={chemin} titre={detail?.nom ?? 'Catégorie inconnue'} onBack={retour} />
      {detail ? <ProgressionGlobale obtenues={detail.obtenues} total={detail.total} /> : null}
    </View>
  );

  const contenu = [styles.zoneCentrale, { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 }];

  if (detail?.niveau === 'parc') {
    return <EcranParc parc={detail} entete={entete} contenu={contenu} />;
  }

  return (
    <ScrollView
      style={styles.screen}
      // Les sections (land, catégorie) s'espacent comme celles d'un parc
      contentContainerStyle={[contenu, !!detail && styles.zoneSections]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {entete}
      {detail ? (
        <SearchField
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Rechercher une prouesse…"
          erreur={!trouvees.length}
        />
      ) : null}
      {detail && !trouvees.length ? (
        <Text style={styles.vide}>Aucune prouesse ne correspond à « {recherche.trim()} ».</Text>
      ) : detail?.niveau === 'land' || detail?.niveau === 'type' ? (
        // Page d'un land : prouesses rangées par catégorie ; page d'une catégorie : par land ou hôtel
        (detail.niveau === 'land' ? parCategorie(trouvees) : parLieu(trouvees)).map(({ titre, prouesses }) => (
          <View key={titre} style={styles.section}>
            <Text style={styles.titreSection} accessibilityRole="header">
              {titre}
            </Text>
            <ListeProuesses prouesses={prouesses} />
          </View>
        ))
      ) : detail ? (
        <ListeProuesses prouesses={trouvees} />
      ) : (
        <Text style={styles.vide}>Cette catégorie est introuvable.</Text>
      )}
    </ScrollView>
  );
}

function ListeProuesses({ prouesses }: { prouesses: Prouesse[] }) {
  return (
    <View style={styles.liste}>
      {prouesses.map((prouesse) => (
        <IndiceRow
          key={prouesse.id}
          titre={prouesse.titre}
          indice={prouesse.sousTitre}
          obtenue={prouesse.obtenue}
          onPress={() => router.push(`/prouesse/${prouesse.id}`)}
        />
      ))}
    </View>
  );
}

// Regroupe les prouesses par type, dans l'ordre des catégories ; celles sans type finissent en « Autres »
function parCategorie(prouesses: Prouesse[]) {
  const groupes = (Object.keys(TYPE_LABELS) as TypeProuesse[]).map((type) => ({
    titre: TYPE_LABELS[type].pluriel,
    prouesses: prouesses.filter((p) => p.type === type),
  }));
  groupes.push({ titre: 'Autres', prouesses: prouesses.filter((p) => !p.type) });
  return groupes.filter((g) => g.prouesses.length);
}

// Regroupe les prouesses par land (ou hôtel) : parcs d'abord, resort ensuite, dans l'ordre des données ;
// au sein d'un parc, lands par ordre alphabétique puis prouesses sans land sous le nom du parc
function parLieu(prouesses: Prouesse[]) {
  const ordreParcs = [...new Set(prouessesSource.map((p) => p.parc))];
  const groupes = new Map<string, { titre: string; parc: string; land?: string; prouesses: Prouesse[] }>();
  for (const prouesse of prouesses) {
    const cle = `${prouesse.parc}|${prouesse.land ?? ''}`;
    const groupe = groupes.get(cle) ?? {
      titre: prouesse.land ?? prouesse.parc,
      parc: prouesse.parc,
      land: prouesse.land,
      prouesses: [],
    };
    groupe.prouesses.push(prouesse);
    groupes.set(cle, groupe);
  }
  const rang = (parc: string) => (estResort(parc) ? ordreParcs.length : 0) + ordreParcs.indexOf(parc);
  return [...groupes.values()].sort(
    (a, b) =>
      rang(a.parc) - rang(b.parc) ||
      Number(!a.land) - Number(!b.land) ||
      (a.land ?? '').localeCompare(b.land ?? '', 'fr'),
  );
}

type EcranParcProps = {
  parc: Categorie;
  entete: ReactNode;
  contenu: StyleProp<ViewStyle>;
};

// Page d'un parc : en-tête, recherche, grille des lands, puis les types de prouesses limités au parc
function EcranParc({ parc, entete, contenu }: EcranParcProps) {
  const [recherche, setRecherche] = useState('');
  const sousCategories = useMemo(
    () => rechercherCarnet(construireCarnet(parc.prouesses).filter((c) => c.niveau !== 'parc'), recherche),
    [parc, recherche],
  );
  const lands = sousCategories.filter((c) => c.niveau === 'land');
  const types = sousCategories.filter((c) => c.niveau === 'type');
  // En recherche, les prouesses trouvées dans les lands et catégories du parc sont listées directement
  const trouvees = useMemo(
    () => (recherche.trim() ? rechercherProuesses(parc.prouesses, recherche) : []),
    [parc, recherche],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[contenu, styles.zoneSections]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {entete}
      <SearchField
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher une attraction…"
        erreur={!lands.length && !types.length && !trouvees.length}
      />

      <ResultatsProuesses prouesses={trouvees} />

      {lands.length ? (
        <View style={styles.section}>
          <Text style={styles.titreSection} accessibilityRole="header">
            {estResort(parc.nom) ? 'Lieux' : 'Lands'}
          </Text>
          <GrilleCategories categories={lands} onPress={(land) => router.push(`/prouesses/${land.id}`)} />
        </View>
      ) : null}

      {types.length ? (
        <View style={styles.section}>
          <Text style={styles.titreSection} accessibilityRole="header">
            Catégories
          </Text>
          <View style={styles.liste}>
            {types.map((type) => (
              <ProgressionRow
                key={type.id}
                titre={type.nom}
                obtenues={type.obtenues}
                total={type.total}
                onPress={() => router.push({ pathname: '/prouesses/[id]', params: { id: type.id, parc: parc.id } })}
              />
            ))}
          </View>
        </View>
      ) : null}

      {!lands.length && !types.length ? (
        recherche.trim() ? (
          trouvees.length ? null : <Text style={styles.vide}>Aucun résultat pour « {recherche.trim()} ».</Text>
        ) : (
          // Parc sans land ni type (ex. hôtels) : liste directe de ses prouesses
          <View style={styles.liste}>
            {parc.prouesses.map((prouesse) => (
              <IndiceRow
                key={prouesse.id}
                titre={prouesse.titre}
                indice={prouesse.sousTitre}
                obtenue={prouesse.obtenue}
                onPress={() => router.push(`/prouesse/${prouesse.id}`)}
              />
            ))}
          </View>
        )
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  zoneCentrale: {
    paddingHorizontal: 16,
    gap: 12,
  },
  zoneSections: {
    gap: 24,
  },
  section: {
    gap: 16,
  },
  titreSection: {
    fontFamily: fonts.loraBold,
    fontSize: 23,
    lineHeight: 23 * 1.1,
    color: colors.textPrimaryAlt,
  },
  liste: {
    gap: 8,
  },
  vide: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
