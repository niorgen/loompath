import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderTitle } from '@/components/HeaderTitle';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ProgressionRow } from '@/components/ProgressionRow';
import { SearchField } from '@/components/SearchField';
import { rechercherCarnet } from '@/data';
import { useCarnet } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function CarnetScreen() {
  const insets = useSafeAreaInsets();
  const [recherche, setRecherche] = useState('');
  const carnet = useCarnet();
  const resultats = useMemo(() => rechercherCarnet(carnet, recherche), [carnet, recherche]);

  return (
    <View style={styles.screen}>
      <View style={[styles.entete, { paddingTop: insets.top + 16 }]}>
        <HeaderTitle titre="Carnets des prouesses" />
        <SearchField value={recherche} onChangeText={setRecherche} />
      </View>

      <FlatList
        data={resultats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProgressionRow
            titre={item.nom}
            obtenues={item.obtenues}
            total={item.total}
            onPress={() => router.push(`/prouesses/${item.id}`)}
          />
        )}
        contentContainerStyle={[styles.liste, { paddingBottom: NAV_HEIGHT + insets.bottom + 24 }]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.vide}>Aucune catégorie ne correspond à « {recherche.trim()} ».</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  entete: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  liste: {
    paddingHorizontal: 16,
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
