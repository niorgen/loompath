import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DetailHeader } from '@/components/DetailHeader';
import { IndiceRow } from '@/components/IndiceRow';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ProgressionGlobale } from '@/components/ProgressionGlobale';
import { useCarnet } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function DetailProuessesScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useCarnet().find((a) => a.id === id);

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/prouesses'));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.zoneCentrale,
        { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <DetailHeader surtitre="Prouesses" titre={detail?.nom ?? 'Catégorie inconnue'} onBack={retour} />

      {detail ? (
        <>
          <ProgressionGlobale obtenues={detail.obtenues} total={detail.total} />
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
        </>
      ) : (
        <Text style={styles.vide}>Cette catégorie est introuvable.</Text>
      )}
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
