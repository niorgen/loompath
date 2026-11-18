import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GrilleCategories } from '@/components/GrilleCategories';
import { HeaderTitle } from '@/components/HeaderTitle';
import { ListeProuesses, type SectionProuesses } from '@/components/ListeProuesses';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { SearchField } from '@/components/SearchField';
import { Squelette } from '@/components/Squelette';
import { estResort, estSaisonniere, rechercherCarnet, rechercherProuesses } from '@/data';
import { useAffichageDiffere } from '@/hooks/useAffichageDiffere';
import { useTitrePage } from '@/hooks/useTitrePage';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function CarnetScreen() {
  useTitrePage('Prouesses');
  const insets = useSafeAreaInsets();
  const [recherche, setRecherche] = useState('');
  // En-tête et recherche s'affichent tout de suite ; la grille, longue à monter, après son squelette
  const pret = useAffichageDiffere();
  const carnet = useCarnet();
  const prouesses = useProuesses();
  const resultats = useMemo(() => rechercherCarnet(carnet, recherche), [carnet, recherche]);
  const enRecherche = !!recherche.trim();
  // En recherche, les prouesses trouvées dans toutes les catégories sont listées directement ; celles de
  // saison ne se trouvent que via la catégorie Saisons, qui ressort quand l'une d'elles correspond
  const trouvees = useMemo(
    () => (enRecherche ? rechercherProuesses(prouesses.filter((p) => !estSaisonniere(p)), recherche) : []),
    [enRecherche, prouesses, recherche],
  );

  // Les lands se consultent depuis la page de leur parc ; ils ne remontent ici qu'en recherche.
  // Les univers se consultent depuis la page Personnages
  const sections = [
    { titre: 'Parcs', categories: resultats.filter((c) => c.niveau === 'parc' && !estResort(c.nom)) },
    { titre: 'Resort', categories: resultats.filter((c) => c.niveau === 'parc' && estResort(c.nom)) },
    { titre: 'Lands', categories: enRecherche ? resultats.filter((c) => c.niveau === 'land') : [] },
    { titre: 'Catégories', categories: resultats.filter((c) => c.niveau === 'type') },
  ].filter((s) => s.categories.length);
  const aucunResultat = pret && !sections.length && !trouvees.length;

  const enteteListe = (
    <View style={styles.zone}>
      <HeaderTitle titre="Prouesses" />
      <SearchField
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher une attraction…"
        erreur={aucunResultat}
      />

      {!pret ? (
        // Parcs, Resort, Catégories : nombre de cartes proche de celui du carnet
        <Squelette sections={[2, 2, 9].map((nombre) => ({ forme: 'grille', nombre }))} />
      ) : null}
    </View>
  );

  // Prouesses trouvées en recherche, en liste virtualisée au-dessus des catégories qui correspondent
  const prouessesTrouvees: SectionProuesses[] = pret && trouvees.length ? [{ titre: 'Prouesses', data: trouvees }] : [];

  const pied =
    pret && (sections.length || aucunResultat) ? (
      <View style={[styles.zone, styles.pied]}>
        {sections.map((section) => (
          <View key={section.titre} style={styles.section}>
            <Text style={styles.titreSection} accessibilityRole="header">
              {section.titre}
            </Text>
            <GrilleCategories categories={section.categories} onPress={(c) => router.push(`/prouesses/${c.id}`)} />
          </View>
        ))}

        {aucunResultat ? <Text style={styles.vide}>Aucun résultat pour « {recherche.trim()} ».</Text> : null}
      </View>
    ) : null;

  return (
    <ListeProuesses
      sections={prouessesTrouvees}
      entete={enteteListe}
      pied={pied}
      contenu={[styles.contenu, { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 }]}
    />
  );
}

const styles = StyleSheet.create({
  contenu: {
    paddingHorizontal: 16,
  },
  zone: {
    gap: 24,
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
  vide: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
