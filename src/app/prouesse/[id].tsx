import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { BoutonAction } from '@/components/BoutonAction';
import { choisirSourcePhoto } from '@/components/choisirSourcePhoto';
import { confirmer } from '@/components/confirmer';
import { HeaderTitle } from '@/components/HeaderTitle';
import { TYPE_LABELS } from '@/data';
import { useSourcePhoto } from '@/hooks/useSourcePhoto';
import { supprimerValidation, useProuesses, validerProuesse } from '@/state/validations';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

export default function ProuesseScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prouesse = useProuesses().find((p) => p.id === id);
  const { source, onError } = useSourcePhoto(prouesse?.photoUri, prouesse?.miniature);
  const [enCours, setEnCours] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/prouesses'));

  // La validation se fait avec une photo de la prouesse, prise sur place ou tirée de la pellicule
  const valider = async () => {
    if (!prouesse) return;
    const sourcePhoto = await choisirSourcePhoto(prouesse.obtenue ? 'Modifier la photo' : 'Valider la prouesse');
    if (!sourcePhoto) return;
    const premiere = !prouesse.obtenue;
    setEnCours(true);
    try {
      if (sourcePhoto === 'appareil') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Appareil photo requis',
            'Autorisez l’accès à l’appareil photo pour valider vos prouesses.',
          );
          return;
        }
      }
      // quality 1 : pas de recompression de l'original par le sélecteur, la photo est réduite ensuite
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: 'images', quality: 1 };
      const resultat =
        sourcePhoto === 'appareil'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (!resultat.canceled) {
        await validerProuesse(prouesse.id, resultat.assets[0].uri);
        // Célébration à la première validation seulement (une nouvelle photo ne rapporte rien)
        if (premiere) router.push(`/validation/${prouesse.id}`);
      }
    } catch {
      Alert.alert(
        'Photo impossible',
        sourcePhoto === 'appareil'
          ? 'L’appareil photo n’est pas disponible sur cet appareil.'
          : 'La pellicule n’est pas accessible sur cet appareil.',
      );
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
        style={({ pressed }) => [styles.bouton, styles.retour, { top: insets.top + MARGE }, pressed && { opacity: 0.7 }]}
      >
        <Image source={require('../../../assets/icons/chevron-left-16.svg')} style={styles.chevron} contentFit="contain" />
      </Pressable>

      {/* Une fois la prouesse validée, la photo se change par le menu « ⋯ » (Modifier la photo) */}
      {prouesse && !prouesse.obtenue ? (
        <View style={[styles.zoneBas, { paddingBottom: 16 + insets.bottom }]}>
          <BoutonAction
            libelle="Valider la prouesse"
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
            style={({ pressed }) => [styles.bouton, styles.options, { top: insets.top + MARGE }, pressed && { opacity: 0.7 }]}
          >
            <Image source={require('../../../assets/icons/more-16.svg')} style={styles.chevron} contentFit="contain" />
          </Pressable>
          {menuOuvert ? (
            <View style={[styles.menu, { top: insets.top + MARGE + 34 + 8 }]} accessibilityRole="menu">
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

// Boutons flottants sur la photo : même marge en haut et sur les côtés
const MARGE = 16;

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
    left: MARGE,
  },
  options: {
    right: MARGE,
  },
  menu: {
    position: 'absolute',
    right: MARGE,
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
