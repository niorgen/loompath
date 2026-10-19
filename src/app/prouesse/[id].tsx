import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoutonAction } from '@/components/BoutonAction';
import { DetailHeader } from '@/components/DetailHeader';
import { FenetreAstrale } from '@/components/FenetreAstrale';
import { useProuesses, validerProuesse } from '@/state/validations';
import { colors, fonts } from '@/theme';

export default function FenetreAstraleScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prouesse = useProuesses().find((p) => p.id === id);
  const [enCours, setEnCours] = useState(false);

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/prouesses'));

  // La validation se fait en photographiant la prouesse
  const valider = async () => {
    if (!prouesse) return;
    setEnCours(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Appareil photo requis',
          'Autorisez l’accès à l’appareil photo pour valider vos prouesses.',
        );
        return;
      }
      const resultat = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7 });
      if (!resultat.canceled) {
        await validerProuesse(prouesse.id, resultat.assets[0].uri);
      }
    } catch {
      Alert.alert('Photo impossible', 'L’appareil photo n’est pas disponible sur cet appareil.');
    } finally {
      setEnCours(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.contenu, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <DetailHeader surtitre="Prouesses" titre={prouesse?.titre ?? 'Prouesse inconnue'} onBack={retour} />

        {prouesse ? (
          <View style={styles.corps}>
            <FenetreAstrale
              photoUri={prouesse.photoUri}
              miniature={prouesse.miniature}
              libelle={prouesse.obtenue ? 'Prouesse accomplie' : 'Prouesse à découvrir'}
            />
            <View style={styles.message}>
              <Text style={styles.titre}>Indice</Text>
              <Text style={styles.recit}>{prouesse.description ?? prouesse.sousTitre}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.recit}>Cette prouesse est introuvable.</Text>
        )}
      </ScrollView>

      {prouesse ? (
        <View style={[styles.zoneBas, { paddingBottom: 16 + insets.bottom }]}>
          <BoutonAction
            // Une prouesse validée peut être rephotographiée (la nouvelle photo remplace l'ancienne)
            libelle={prouesse.obtenue ? 'Reprendre la photo' : 'Valider la prouesse'}
            onPress={valider}
            chargement={enCours}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenu: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    // En-tête (pb 24) puis zone illustrée (pt 16) dans le design
    gap: 40,
  },
  corps: {
    gap: 22,
  },
  message: {
    gap: 6,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 34,
    lineHeight: 34 * 1.02,
    color: colors.textPrimaryAlt,
  },
  recit: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: 13 * 1.45,
    color: colors.textNavInactive,
  },
  zoneBas: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
});
