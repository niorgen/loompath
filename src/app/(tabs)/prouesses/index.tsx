import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GrilleCategories } from '@/components/GrilleCategories';
import { HeaderTitle } from '@/components/HeaderTitle';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ResultatsProuesses } from '@/components/ResultatsProuesses';
import { SearchField } from '@/components/SearchField';
import { estResort, rechercherCarnet, rechercherProuesses } from '@/data';
import { useTitrePage } from '@/hooks/useTitrePage';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function CarnetScreen() {
  useTitrePage('Prouesses');
  const insets = useSafeAreaInsets();
  const [recherche, setRecherche] = useState('');
  const carnet = useCarnet();
  const prouesses = useProuesses();
  const resultats = useMemo(() => rechercherCarnet(carnet, recherche), [carnet, recherche]);
  const enRecherche = !!recherche.trim();
  // En recherche, les prouesses trouvées dans toutes les catégories sont listées directement
  const trouvees = useMemo(
    () => (enRecherche ? rechercherProuesses(prouesses, recherche) : []),
    [enRecherche, prouesses, recherche],
  );

  // Les lands se consultent depuis la page de leur parc ; ils ne remontent ici qu'en recherche
  const sections = [
    { titre: 'Parcs', categories: resultats.filter((c) => c.niveau === 'parc' && !estResort(c.nom)) },
    { titre: 'Resort', categories: resultats.filter((c) => c.niveau === 'parc' && estResort(c.nom)) },
    { titre: 'Lands', categories: enRecherche ? resultats.filter((c) => c.niveau === 'land') : [] },
    { titre: 'Catégories', categories: resultats.filter((c) => c.niveau === 'type') },
  ].filter((s) => s.categories.length);
  const aucunResultat = !sections.length && !trouvees.length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.contenu, { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 }]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <HeaderTitle titre="Prouesses" />
      <SearchField
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher une attraction…"
        erreur={aucunResultat}
      />

      <ResultatsProuesses prouesses={trouvees} />

      {sections.map((section) => (
        <View key={section.titre} style={styles.section}>
          <Text style={styles.titreSection} accessibilityRole="header">
            {section.titre}
          </Text>
          <GrilleCategories categories={section.categories} onPress={(c) => router.push(`/prouesses/${c.id}`)} />
        </View>
      ))}

      {aucunResultat ? (
        <Text style={styles.vide}>Aucun résultat pour « {recherche.trim()} ».</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contenu: {
    paddingHorizontal: 16,
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
  vide: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
