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
import { SearchField } from '@/components/SearchField';
import { construireCarnet, estResort, rechercherCarnet, type Categorie } from '@/data';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function DetailProuessesScreen() {
  const insets = useSafeAreaInsets();
  // parc : identifiant du parc quand la catégorie est ouverte depuis sa page (ex. les Secrets d'un seul parc)
  const { id, parc: parcId } = useLocalSearchParams<{ id: string; parc?: string }>();
  const prouesses = useProuesses();
  const carnet = useCarnet();
  const parc = parcId ? carnet.find((c) => c.id === parcId && c.niveau === 'parc') : undefined;
  const categories = useMemo(
    () => (parc ? construireCarnet(prouesses.filter((p) => p.parc === parc.nom)) : carnet),
    [parc, prouesses, carnet],
  );
  const detail = categories.find((c) => c.id === id);

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
    <ScrollView style={styles.screen} contentContainerStyle={contenu} showsVerticalScrollIndicator={false}>
      {entete}
      {detail ? (
        <View style={styles.liste}>
          {detail.prouesses.map((prouesse) => (
            <IndiceRow
              key={prouesse.id}
              titre={prouesse.titre}
              indice={prouesse.sousTitre}
              obtenue={prouesse.obtenue}
              onPress={() => router.push(`/prouesse/${prouesse.id}`)}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.vide}>Cette catégorie est introuvable.</Text>
      )}
    </ScrollView>
  );
}

type EcranParcProps = {
  parc: Categorie;
  entete: ReactNode;
  contenu: StyleProp<ViewStyle>;
};

// Page d'un parc : recherche, grille des lands, puis les types de prouesses limités au parc
function EcranParc({ parc, entete, contenu }: EcranParcProps) {
  const [recherche, setRecherche] = useState('');
  const sousCategories = useMemo(
    () => rechercherCarnet(construireCarnet(parc.prouesses).filter((c) => c.niveau !== 'parc'), recherche),
    [parc, recherche],
  );
  const lands = sousCategories.filter((c) => c.niveau === 'land');
  const types = sousCategories.filter((c) => c.niveau === 'type');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[contenu, styles.zoneParc]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <SearchField value={recherche} onChangeText={setRecherche} placeholder="Rechercher une attraction…" />
      {entete}

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
          <Text style={styles.vide}>Aucune catégorie ne correspond à « {recherche.trim()} ».</Text>
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
    backgroundColor: colors.background,
  },
  zoneCentrale: {
    paddingHorizontal: 16,
    gap: 12,
  },
  zoneParc: {
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
