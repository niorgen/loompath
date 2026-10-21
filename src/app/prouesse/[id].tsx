import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { BoutonAction } from '@/components/BoutonAction';
import { HeaderTitle } from '@/components/HeaderTitle';
import { TYPE_LABELS } from '@/data';
import { useSourcePhoto } from '@/hooks/useSourcePhoto';
import { supprimerValidation, useProuesses, validerProuesse } from '@/state/validations';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

// Alert n'affiche pas de boutons sur le web : on passe par la confirmation du navigateur
function confirmer(titre: string, message: string, libelle: string) {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${titre}\n\n${message}`));
  return new Promise<boolean>((resolve) =>
    Alert.alert(titre, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
      { text: libelle, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

export default function ProuesseScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prouesse = useProuesses().find((p) => p.id === id);
  const { source, onError } = useSourcePhoto(prouesse?.photoUri, prouesse?.miniature);
  const [enCours, setEnCours] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

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

  const modifierPhoto = () => {
    setMenuOuvert(false);
    valider();
  };

  const supprimerPhoto = async () => {
    setMenuOuvert(false);
    if (!prouesse) return;
    const ok = await confirmer(
      'Supprimer la photo ?',
      'La prouesse ne sera plus comptée comme accomplie.',
      'Supprimer',
    );
    if (ok) await supprimerValidation(prouesse.id);
  };

  const libellePhoto = prouesse?.obtenue ? 'Prouesse accomplie' : 'Prouesse à découvrir';

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo de validation pleine largeur, sous la barre de statut */}
        <View style={styles.photo}>
          {source ? (
            <Image
              source={{ uri: source }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityLabel={libellePhoto}
              onError={onError}
            />
          ) : (
            <View style={styles.vide}>
              <Image source={require('../../../assets/icons/orbit.svg')} style={styles.orbit} contentFit="contain" />
              <Text style={styles.libelleVide}>{libellePhoto.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {prouesse ? (
          <>
            {/* En-tête du design : titre, sous-titre en capitales, puis badges parc et type */}
            <View style={styles.entete}>
              <HeaderTitle titre={prouesse.titre} />
              {prouesse.sousTitre ? <Text style={styles.sousTitre}>{prouesse.sousTitre.toUpperCase()}</Text> : null}
              <View style={styles.badges}>
                <Badge libelle={prouesse.parc} ton="accent" />
                {prouesse.type ? <Badge libelle={TYPE_LABELS[prouesse.type].singulier} ton="action" /> : null}
              </View>
            </View>
            {/* Le sous-titre est déjà affiché dans l'en-tête : pas de récit sans description */}
            {prouesse.description ? (
              <View style={styles.corps}>
                <Text style={styles.recit}>{prouesse.description}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.corps}>
            <HeaderTitle titre="Prouesse inconnue" />
            <Text style={styles.recit}>Cette prouesse est introuvable.</Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={retour}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        style={({ pressed }) => [styles.bouton, styles.retour, { top: insets.top + 8 }, pressed && { opacity: 0.7 }]}
      >
        <Image source={require('../../../assets/icons/chevron-left-16.svg')} style={styles.chevron} contentFit="contain" />
      </Pressable>

      {prouesse ? (
        <View style={[styles.zoneBas, { paddingBottom: 16 + insets.bottom }]}>
          <BoutonAction
            // Une prouesse validée peut être rephotographiée (la nouvelle photo remplace l'ancienne)
            libelle={prouesse.obtenue ? 'Reprendre la photo' : 'Valider la prouesse'}
            onPress={valider}
            chargement={enCours}
            picto="Point photo"
            fleche
          />
        </View>
      ) : null}

      {/* Sous-menu de la photo, en dernier pour passer au-dessus du reste ; seulement quand la prouesse en a une */}
      {prouesse?.obtenue ? (
        <>
          {menuOuvert ? (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setMenuOuvert(false)}
              accessibilityLabel="Fermer le menu"
            />
          ) : null}
          <Pressable
            onPress={() => setMenuOuvert((ouvert) => !ouvert)}
            accessibilityRole="button"
            accessibilityLabel="Options de la photo"
            accessibilityState={{ expanded: menuOuvert }}
            hitSlop={8}
            style={({ pressed }) => [styles.bouton, styles.options, { top: insets.top + 8 }, pressed && { opacity: 0.7 }]}
          >
            <Image source={require('../../../assets/icons/more-16.svg')} style={styles.chevron} contentFit="contain" />
          </Pressable>
          {menuOuvert ? (
            <View style={[styles.menu, { top: insets.top + 8 + 34 + 8 }]} accessibilityRole="menu">
              <Pressable
                onPress={modifierPhoto}
                accessibilityRole="menuitem"
                style={({ pressed }) => [styles.entreeMenu, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.libelleMenu}>Modifier la photo</Text>
              </Pressable>
              <View style={styles.separateur} />
              <Pressable
                onPress={supprimerPhoto}
                accessibilityRole="menuitem"
                style={({ pressed }) => [styles.entreeMenu, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.libelleMenu}>Supprimer la photo</Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  photo: {
    height: 436,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surfacePlaceholder,
  },
  vide: {
    alignItems: 'center',
    gap: 9,
  },
  orbit: {
    width: 24,
    height: 24,
  },
  libelleVide: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textPrimaryAlt,
  },
  bouton: {
    position: 'absolute',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.actionSecondary,
    borderRadius: radius.pill,
  },
  retour: {
    left: 16,
  },
  options: {
    right: 16,
  },
  menu: {
    position: 'absolute',
    right: 16,
    minWidth: 180,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 0.7,
    borderColor: colors.borderCard,
    borderRadius: radius.md,
  },
  entreeMenu: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  libelleMenu: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textPrimary,
  },
  separateur: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  chevron: {
    width: 16,
    height: 16,
  },
  entete: {
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sousTitre: {
    fontFamily: fonts.interExtraBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    letterSpacing: 1.2,
    color: colors.accent,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  corps: {
    gap: 16,
    padding: 16,
  },
  recit: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  zoneBas: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
});
