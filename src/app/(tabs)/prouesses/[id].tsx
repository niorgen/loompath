import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DetailHeader } from '@/components/DetailHeader';
import { GrilleCategories } from '@/components/GrilleCategories';
import { ListeProuesses, type SectionProuesses } from '@/components/ListeProuesses';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ProgressionGlobale } from '@/components/ProgressionGlobale';
import { ProgressionRow } from '@/components/ProgressionRow';
import { SearchField } from '@/components/SearchField';
import { Squelette, type SectionSquelette } from '@/components/Squelette';
import {
  construireCarnet,
  estResort,
  estSaisonniere,
  prouessesSource,
  rechercherCarnet,
  rechercherProuesses,
  SAISONS,
  TYPE_LABELS,
  type Categorie,
  type Prouesse,
  type TypeProuesse,
} from '@/data';
import { useAffichageDiffere } from '@/hooks/useAffichageDiffere';
import { useTitrePage } from '@/hooks/useTitrePage';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function DetailProuessesScreen() {
  const insets = useSafeAreaInsets();
  // parc / land : identifiant du parc ou du land qui limite la catégorie (ex. les Secrets d'un seul parc,
  // ouverts depuis sa page, ou ceux du land où se trouve le joueur, ouverts depuis le Journal)
  // saison : page ouverte depuis la page Saisons (un de ses lieux ou de ses types) ; limitée aux prouesses
  // de saison, rangées par leur vrai type (Personnages, Activités…)
  // sansLand : avec parc, limite aux prouesses du parc qui n'ont pas de land (case du parc dans une grille de lieux)
  const {
    id,
    parc: parcId,
    land: landId,
    saison,
    sansLand,
  } = useLocalSearchParams<{ id: string; parc?: string; land?: string; saison?: string; sansLand?: string }>();
  const dansSaisons = saison === '1';
  const horsLand = sansLand === '1';
  const prouesses = useProuesses();
  const carnet = useCarnet();
  const parc = parcId ? carnet.find((c) => c.id === parcId && c.niveau === 'parc') : undefined;
  const land = landId ? carnet.find((c) => c.id === landId && c.niveau === 'land') : undefined;
  const categories = useMemo(() => {
    const base = dansSaisons ? prouesses.filter(estSaisonniere) : prouesses;
    const options = { saisonsParType: dansSaisons };
    return parc
      ? construireCarnet(base.filter((p) => p.parc === parc.nom && (!horsLand || !p.land)), options)
      : land
        ? construireCarnet(base.filter((p) => p.land === land.nom), options)
        : dansSaisons
          ? construireCarnet(base, options)
          : carnet;
  }, [parc, land, prouesses, carnet, dansSaisons, horsLand]);
  const detail = categories.find((c) => c.id === id);
  useTitrePage(detail?.nom ?? 'Prouesses');
  const [recherche, setRecherche] = useState('');
  const trouvees = useMemo(() => rechercherProuesses(detail?.prouesses ?? [], recherche), [detail, recherche]);
  // En-tête, jauge et recherche s'affichent tout de suite ; les listes, longues à monter, après leur squelette
  const pret = useAffichageDiffere();
  // Page Personnages : seulement la grille des univers ; les personnages se listent dans chaque univers,
  // ou directement en recherche
  const estPersonnages = detail?.niveau === 'type' && detail.nom === TYPE_LABELS.Personnages.pluriel;
  const enRecherche = !!recherche.trim();
  // Les personnages de saison n'ont pas d'univers : ils se listent directement
  const univers =
    estPersonnages && !enRecherche && !dansSaisons ? categories.filter((c) => c.niveau === 'univers') : [];
  // Page d'une catégorie : d'abord la grille de ses lieux (lands, et parcs pour les prouesses sans land),
  // comme la page d'un parc ; chaque lieu liste les prouesses de la catégorie qui s'y trouvent.
  // Pas de grille si la page est déjà limitée à un lieu, s'il n'y a qu'un lieu, ni en recherche
  const lieux = useMemo(
    () =>
      detail?.niveau === 'type' && !(estPersonnages && !dansSaisons) && !land && !horsLand
        ? lieuxDe(detail.prouesses)
        : [],
    [detail, estPersonnages, dansSaisons, land, horsLand],
  );
  const grilleLieux = lieux.length > 1 && !enRecherche ? lieux : [];
  const ouvrirLieu = (lieu: Categorie) =>
    router.push({
      pathname: '/prouesses/[id]',
      params:
        lieu.niveau === 'land'
          ? { id, land: lieu.id, saison }
          : { id, parc: lieu.id, sansLand: '1', saison },
    });
  // Grilles affichées à la place de la liste (univers des personnages ou lieux d'une catégorie)
  const grille = univers.length ? univers : grilleLieux;

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/prouesses'));

  const ariane = (nomParc: string) => `${estResort(nomParc) ? 'Resort' : 'Parcs'} / ${nomParc}`;

  // Fil d'Ariane : « Prouesses » pour un parc, « Parcs / <parc> » pour un land ou un type du parc,
  // « Catégories » pour un type tous parcs confondus, « Catégories / Personnages » pour un univers,
  // « Catégories / Saisons » pour une page ouverte depuis la page Saisons
  const chemin = !detail
    ? 'Prouesses'
    : dansSaisons
      ? `Catégories / ${SAISONS}`
      : detail.niveau === 'parc'
        ? 'Prouesses'
        : detail.niveau === 'land'
          ? ariane(detail.prouesses[0]?.parc ?? '')
          : parc
            ? ariane(parc.nom)
            : land
              ? `${ariane(land.prouesses[0]?.parc ?? '')} / ${land.nom}`
              : detail.niveau === 'univers'
                ? `Catégories / ${TYPE_LABELS.Personnages.pluriel}`
                : 'Catégories';

  // En-tête et jauge forment un seul bloc dans le design
  const entete = (
    <View>
      <DetailHeader surtitre={chemin} titre={detail?.nom ?? 'Catégorie inconnue'} onBack={retour} />
      {detail ? <ProgressionGlobale obtenues={detail.obtenues} total={detail.total} /> : null}
    </View>
  );

  // Pas de gap sur le contenu d'une liste virtualisée : les espacements viennent des sections
  const contenuListe = [styles.zoneListe, { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 }];

  if (detail?.niveau === 'parc') {
    return (
      <EcranParc
        parc={detail}
        entete={entete}
        contenu={contenuListe}
        saison={dansSaisons}
        parcDesTypes={detail.id}
      />
    );
  }

  // Page Saisons : même rangement qu'un parc (lieux, puis types), limité au parc d'où elle est ouverte
  if (detail?.niveau === 'type' && detail.nom === SAISONS && !dansSaisons) {
    return <EcranParc parc={detail} entete={entete} contenu={contenuListe} saison parcDesTypes={parcId} />;
  }

  // Liste des prouesses : page d'un land rangée par catégorie, page d'une catégorie par land ou hôtel,
  // univers (ou recherche dans les personnages) en une seule section sans titre
  const sections: SectionProuesses[] =
    !pret || grille.length || !detail || !trouvees.length
      ? []
      : detail.niveau === 'land'
        ? parCategorie(trouvees, dansSaisons).map(({ titre, prouesses }) => ({ titre, data: prouesses }))
        : detail.niveau === 'type' && (!estPersonnages || dansSaisons)
          ? parLieu(trouvees).map(({ titre, prouesses }) => ({ titre, data: prouesses }))
          : [{ titre: '', data: trouvees }];

  // En-tête de la liste : tout ce qui précède les prouesses (élément, et non composant,
  // pour que le champ de recherche garde le focus d'un rendu à l'autre)
  const enteteListe = (
    // Les sections (land, catégorie) s'espacent comme celles d'un parc
    <View style={detail ? styles.zoneSections : styles.zoneEntete}>
      {entete}
      {detail ? (
        <SearchField
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Rechercher une prouesse…"
          erreur={!trouvees.length}
        />
      ) : null}
      {detail && !pret ? (
        <Squelette
          sections={
            grille.length ? [{ forme: 'grille', nombre: grille.length }] : squeletteDetail(detail, dansSaisons)
          }
        />
      ) : null}
      {pret && grilleLieux.length && !univers.length ? (
        <View style={styles.section}>
          <Text style={styles.titreSection} accessibilityRole="header">
            Lieux
          </Text>
          <GrilleCategories categories={grilleLieux} onPress={ouvrirLieu} />
        </View>
      ) : null}
      {pret && univers.length ? (
        <View style={styles.section}>
          <Text style={styles.titreSection} accessibilityRole="header">
            Univers
          </Text>
          <GrilleCategories
            categories={univers}
            // Un univers ouvert depuis les personnages d'un parc ou d'un land reste limité à ce lieu
            onPress={(u) => router.push({ pathname: '/prouesses/[id]', params: { id: u.id, parc: parcId, land: landId } })}
          />
        </View>
      ) : null}
      {!pret || grille.length ? null : detail && !trouvees.length ? (
        <Text style={styles.vide}>Aucune prouesse ne correspond à « {recherche.trim()} ».</Text>
      ) : !detail ? (
        <Text style={styles.vide}>Cette catégorie est introuvable.</Text>
      ) : null}
    </View>
  );

  return <ListeProuesses sections={sections} entete={enteteListe} contenu={contenuListe} />;
}

// Lignes affichées au plus par section du squelette : le reste est sous le pli
const LIGNES_SQUELETTE = 6;

// Squelette d'une page de land, de catégorie ou d'univers : mêmes sections que la page
function squeletteDetail(detail: Categorie, dansSaisons: boolean): SectionSquelette[] {
  const sections =
    detail.niveau === 'land'
      ? parCategorie(detail.prouesses, dansSaisons)
      : detail.niveau === 'type'
        ? parLieu(detail.prouesses)
        : [{ titre: '', prouesses: detail.prouesses }];
  return sections.map(({ titre, prouesses }) => ({
    forme: 'liste',
    nombre: Math.min(prouesses.length, LIGNES_SQUELETTE),
    titre: !!titre,
  }));
}

// Regroupe les prouesses par type, dans l'ordre des catégories ; celles de saison forment leur propre
// groupe, quel que soit leur type (sauf saisonsParType, depuis la page Saisons) ; celles sans type
// finissent en « Autres »
function parCategorie(prouesses: Prouesse[], saisonsParType = false) {
  const horsSaison = saisonsParType ? prouesses : prouesses.filter((p) => !estSaisonniere(p));
  const groupes = (Object.keys(TYPE_LABELS) as TypeProuesse[]).map((type) => ({
    titre: TYPE_LABELS[type].pluriel,
    prouesses: horsSaison.filter((p) => p.type === type),
  }));
  if (!saisonsParType) groupes.push({ titre: SAISONS, prouesses: prouesses.filter(estSaisonniere) });
  groupes.push({ titre: 'Autres', prouesses: horsSaison.filter((p) => !p.type) });
  return groupes.filter((g) => g.prouesses.length);
}

// Lieux d'une catégorie, pour sa grille : ses lands (parcs d'abord, resort ensuite, puis ordre
// alphabétique), suivis des parcs qui ont des prouesses sans land (ex. Disney Village), comptées seules
function lieuxDe(prouesses: Prouesse[]): Categorie[] {
  const ordreParcs = [...new Set(prouessesSource.map((p) => p.parc))];
  const rang = (parc: string) => (estResort(parc) ? ordreParcs.length : 0) + ordreParcs.indexOf(parc);
  const lands = construireCarnet(prouesses.filter((p) => p.land))
    .filter((c) => c.niveau === 'land')
    .sort((a, b) => rang(a.prouesses[0].parc) - rang(b.prouesses[0].parc) || a.nom.localeCompare(b.nom, 'fr'));
  const parcs = construireCarnet(prouesses.filter((p) => !p.land)).filter((c) => c.niveau === 'parc');
  return [...lands, ...parcs];
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
  /** Parc, ou catégorie Saisons rangée comme un parc */
  parc: Categorie;
  entete: ReactNode;
  contenu: StyleProp<ViewStyle>;
  /** Page Saisons ou l'une de ses pages : prouesses de saison rangées par leur vrai type,
   * et pages ouvertes depuis celle-ci limitées aux prouesses de saison */
  saison: boolean;
  /** Parc qui limite les types ouverts depuis cette page (aucun pour Saisons tous parcs confondus) */
  parcDesTypes?: string;
};

// Page d'un parc (ou de la catégorie Saisons) : en-tête, recherche, grille des lands (lieux),
// puis les types de prouesses limités au parc
function EcranParc({ parc, entete, contenu, saison, parcDesTypes }: EcranParcProps) {
  const [recherche, setRecherche] = useState('');
  const sousCategories = useMemo(
    () =>
      rechercherCarnet(
        construireCarnet(parc.prouesses, { saisonsParType: saison }).filter(
          // Lieux : les lands, plus les autres parcs (ex. Disney Village) pour leurs prouesses sans land
          (c) => c.niveau !== 'parc' || (c.id !== parc.id && c.prouesses.some((p) => !p.land)),
        ),
        recherche,
      ),
    [parc, saison, recherche],
  );
  const lands = sousCategories.filter((c) => c.niveau === 'land' || c.niveau === 'parc');
  const types = sousCategories.filter((c) => c.niveau === 'type');
  const pret = useAffichageDiffere();
  // En recherche, les prouesses trouvées dans les lands et catégories du parc sont listées directement
  const trouvees = useMemo(
    () => (recherche.trim() ? rechercherProuesses(parc.prouesses, recherche) : []),
    [parc, recherche],
  );

  const sansSousCategorie = !lands.length && !types.length;
  const enRecherche = !!recherche.trim();
  // Prouesses listées : celles trouvées en recherche, ou toutes celles d'un parc sans land ni type (ex. hôtels)
  const sections: SectionProuesses[] = !pret
    ? []
    : trouvees.length
      ? [{ titre: 'Prouesses', data: trouvees }]
      : sansSousCategorie && !enRecherche
        ? [{ titre: '', data: parc.prouesses }]
        : [];
  const aucunResultat = pret && sansSousCategorie && enRecherche && !trouvees.length;

  const enteteListe = (
    <View style={styles.zoneSections}>
      {entete}
      <SearchField
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher une attraction…"
        erreur={!lands.length && !types.length && !trouvees.length}
      />

      {!pret ? (
        <Squelette
          sections={
            lands.length || types.length
              ? [
                  ...(lands.length ? [{ forme: 'grille' as const, nombre: lands.length }] : []),
                  ...(types.length ? [{ forme: 'liste' as const, nombre: Math.min(types.length, LIGNES_SQUELETTE) }] : []),
                ]
              : [{ forme: 'liste', nombre: Math.min(parc.prouesses.length, LIGNES_SQUELETTE), titre: false }]
          }
        />
      ) : null}
    </View>
  );

  // Lands et catégories du parc, sous les prouesses trouvées en recherche
  const pied =
    pret && (lands.length || types.length || aucunResultat) ? (
      <View style={[styles.zoneSections, styles.pied]}>
        {lands.length ? (
          <View style={styles.section}>
            <Text style={styles.titreSection} accessibilityRole="header">
              {saison || estResort(parc.nom) ? 'Lieux' : 'Lands'}
            </Text>
            <GrilleCategories
              categories={lands}
              onPress={(lieu) =>
                router.push({ pathname: '/prouesses/[id]', params: { id: lieu.id, saison: saison ? '1' : undefined } })
              }
            />
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
                  onPress={() =>
                    router.push({
                      pathname: '/prouesses/[id]',
                      params: { id: type.id, parc: parcDesTypes, saison: saison ? '1' : undefined },
                    })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {aucunResultat ? <Text style={styles.vide}>Aucun résultat pour « {recherche.trim()} ».</Text> : null}
      </View>
    ) : null;

  return <ListeProuesses sections={sections} entete={enteteListe} pied={pied} contenu={contenu} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  zoneSections: {
    gap: 24,
  },
  zoneListe: {
    paddingHorizontal: 16,
  },
  zoneEntete: {
    gap: 12,
  },
  pied: {
    paddingTop: 24,
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
