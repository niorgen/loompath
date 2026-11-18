import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { SectionList, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { IndiceRow } from '@/components/IndiceRow';
import type { Prouesse } from '@/data';
import { colors, fonts } from '@/theme';

/** Section de prouesses ; sans titre, la liste suit directement ce qui la précède */
export type SectionProuesses = { titre: string; data: Prouesse[] };

type Props = {
  sections: SectionProuesses[];
  /** Tout ce qui précède les prouesses (élément, et non composant, pour que le champ de recherche
   * garde le focus d'un rendu à l'autre) */
  entete: ReactNode;
  /** Ce qui suit les prouesses (ex. lands et catégories d'un parc) */
  pied?: ReactNode;
  /** Marges de l'écran ; pas de gap, les espacements viennent des sections */
  contenu: StyleProp<ViewStyle>;
};

// Écran défilant dont les prouesses forment une liste virtualisée : seules les lignes proches
// de l'écran sont montées (les Secrets en comptent plus de 300, toutes montées d'un coup auparavant)
export function ListeProuesses({ sections, entete, pied, contenu }: Props) {
  return (
    <SectionList
      style={styles.screen}
      contentContainerStyle={contenu}
      sections={sections}
      keyExtractor={(prouesse) => prouesse.id}
      ListHeaderComponent={<>{entete}</>}
      ListFooterComponent={pied ? <>{pied}</> : null}
      renderSectionHeader={({ section }) => (
        // 24 entre les sections, 16 entre un titre et sa liste
        <View style={[styles.enteteSection, !!section.titre && styles.enteteSectionTitree]}>
          {section.titre ? (
            <Text style={styles.titreSection} accessibilityRole="header">
              {section.titre}
            </Text>
          ) : null}
        </View>
      )}
      renderItem={({ item }) => (
        <IndiceRow
          titre={item.titre}
          indice={item.sousTitre}
          obtenue={item.obtenue}
          onPress={() => router.push(`/prouesse/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={SeparateurLigne}
      stickySectionHeadersEnabled={false}
      initialNumToRender={12}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
}

// Espace entre deux lignes d'une même section
function SeparateurLigne() {
  return <View style={styles.separateur} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  enteteSection: {
    paddingTop: 24,
  },
  enteteSectionTitree: {
    paddingBottom: 16,
  },
  titreSection: {
    fontFamily: fonts.loraBold,
    fontSize: 23,
    lineHeight: 23 * 1.1,
    color: colors.textPrimaryAlt,
  },
  separateur: {
    height: 8,
  },
});
