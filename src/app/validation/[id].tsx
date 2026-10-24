import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type EasingFunction,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoutonPrincipal } from '@/components/BoutonPrincipal';
import { DegradeAccent, FondNuit } from '@/components/Fonds';
import { Etincelle, Picto, pictoDe, Trace, TRACES } from '@/components/Picto';
import { calculerStats, estLocalisee, POINTS_PAR_PROUESSE, TYPE_LABELS } from '@/data';
import { PICTOS } from '@/data/pictos';
import { useSourcePhoto } from '@/hooks/useSourcePhoto';
import { useTitrePage } from '@/hooks/useTitrePage';
import { useProfil } from '@/state/profil';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors, fonts, illustration, normalLineHeight, radius } from '@/theme';

// Célébration d'une prouesse tout juste validée (artifact « Design », écran « Prouesse validée »)
// La photo tombe en polaroïd, deux anneaux et une gerbe d'étincelles l'entourent, puis les
// points et la progression du land apparaissent.

const JAUNE = PICTOS.Secret.couleur;

// Gerbe d'étincelles : décalage final, taille et couleur (ordre de départ = ordre du tableau)
const ETINCELLES = [
  { dx: 127, dy: 26, taille: 10, couleur: JAUNE },
  { dx: 126, dy: 95, taille: 14, couleur: PICTOS['Mickeys cachés'].couleur },
  { dx: 85, dy: 166, taille: 18, couleur: PICTOS.Personnages.couleur },
  { dx: 3, dy: 130, taille: 22, couleur: colors.accentSecondary },
  { dx: -65, dy: 144, taille: 10, couleur: PICTOS.Spectacles.couleur },
  { dx: -143, dy: 119, taille: 14, couleur: PICTOS['Point photo'].couleur },
  { dx: -126, dy: 32, taille: 18, couleur: PICTOS['Chasse au trésor'].couleur },
  { dx: -155, dy: -31, taille: 22, couleur: JAUNE },
  { dx: -148, dy: -112, taille: 10, couleur: PICTOS['Mickeys cachés'].couleur },
  { dx: -59, dy: -116, taille: 14, couleur: PICTOS.Personnages.couleur },
  { dx: -4, dy: -158, taille: 18, couleur: colors.accentSecondary },
  { dx: 77, dy: -169, taille: 22, couleur: PICTOS.Spectacles.couleur },
  { dx: 100, dy: -84, taille: 10, couleur: PICTOS['Point photo'].couleur },
  { dx: 153, dy: -39, taille: 14, couleur: PICTOS['Chasse au trésor'].couleur },
];

const COURBES = {
  chute: Easing.bezier(0.2, 1.3, 0.4, 1),
  gerbe: Easing.bezier(0.2, 0.7, 0.2, 1),
  rebond: Easing.bezier(0.2, 1.6, 0.4, 1),
  jauge: Easing.bezier(0.3, 0.8, 0.3, 1),
  sortie: Easing.out(Easing.ease),
};

// Valeur de 0 à 1 animée une fois, après un délai (en ms). « Réduire les animations » : état final direct.
function useApparition(delai: number, duree: number, courbe: EasingFunction) {
  const [valeur] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduire) => {
        if (reduire) {
          valeur.setValue(1);
          return;
        }
        animation = Animated.timing(valeur, { toValue: 1, delay: delai, duration: duree, easing: courbe, useNativeDriver: true });
        animation.start();
      });
    return () => animation?.stop();
  }, [valeur, delai, duree, courbe]);
  return valeur;
}

// Fondu en montant de 16 px
function Monte({ delai, style, children }: { delai: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const v = useApparition(delai, 600, COURBES.sortie);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Apparition en grossissant, avec un léger rebond
function Pop({ delai, style, children }: { delai: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const v = useApparition(delai, 500, COURBES.rebond);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Anneau({ delai, couleur }: { delai: number; couleur: string }) {
  const v = useApparition(delai, 1600, COURBES.sortie);
  return (
    <Animated.View
      style={[
        styles.anneau,
        {
          borderColor: couleur,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.9] }) }],
        },
      ]}
    />
  );
}

function EtincelleVolante({ delai, dx, dy, taille, couleur }: (typeof ETINCELLES)[number] & { delai: number }) {
  const v = useApparition(delai, 1400, COURBES.gerbe);
  return (
    <Animated.View
      style={[
        styles.etincelle,
        { width: taille, height: taille, marginLeft: -taille / 2, marginTop: -taille / 2 },
        {
          opacity: v.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '160deg'] }) },
          ],
        },
      ]}
    >
      <Etincelle couleur={couleur} taille={taille} />
    </Animated.View>
  );
}

// Jauge du land : part validée avant cette prouesse, puis remplissage jusqu'à la nouvelle valeur
function Jauge({ obtenues, total }: { obtenues: number; total: number }) {
  const v = useApparition(1200, 1000, COURBES.jauge);
  const depart = obtenues > 0 ? (obtenues - 1) / obtenues : 0;
  return (
    <View style={styles.jauge}>
      <Animated.View
        style={[
          styles.remplissage,
          { width: `${(obtenues / total) * 100}%` },
          { transform: [{ scaleX: v.interpolate({ inputRange: [0, 1], outputRange: [depart, 1] }) }] },
        ]}
      >
        <DegradeAccent />
      </Animated.View>
    </View>
  );
}

export default function ValidationScreen() {
  useTitrePage('Prouesse validée');
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { nom } = useProfil();
  const prouesses = useProuesses();
  const carnet = useCarnet();
  const prouesse = prouesses.find((p) => p.id === id);
  const { source, onError } = useSourcePhoto(prouesse?.photoUri, prouesse?.miniature);
  const chute = useApparition(0, 900, COURBES.chute);

  const score = useMemo(() => calculerStats(prouesses).score, [prouesses]);
  // Progression du land de la prouesse, ou de son parc si elle n'en a pas
  const categorie = carnet.find((c) =>
    prouesse?.land ? c.niveau === 'land' && c.nom === prouesse.land : c.niveau === 'parc' && c.nom === prouesse?.parc,
  );

  const fermer = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const voirSurLaCarte = () => router.navigate({ pathname: '/cartes', params: { focus: id } });

  if (!prouesse) {
    return <View style={styles.screen} />;
  }

  const date = prouesse.dateValidation
    ? new Date(prouesse.dateValidation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : undefined;
  const couleurType = prouesse.type ? PICTOS[prouesse.type].couleur : undefined;

  return (
    <View style={styles.screen}>
      <FondNuit variante="scene" />
      <ScrollView
        contentContainerStyle={[styles.contenu, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={fermer}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          style={({ pressed }) => [styles.fermer, pressed && { opacity: 0.7 }]}
        >
          <Trace trace={TRACES.fermer} couleur={colors.textPrimary} taille={22} epaisseur={2} />
        </Pressable>

        <View style={styles.scene}>
          <View style={styles.centre} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Anneau delai={100} couleur={colors.accentSecondary} />
            <Anneau delai={350} couleur={JAUNE} />
            {ETINCELLES.map((e, i) => (
              <EtincelleVolante key={i} {...e} delai={150 + i * 30} />
            ))}
          </View>

          <Animated.View
            style={[
              styles.polaroid,
              {
                opacity: chute.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
                transform: [
                  { translateY: chute.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) },
                  { scale: chute.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                ],
              },
            ]}
          >
            <View style={styles.photo}>
              {source ? (
                <Image
                  source={{ uri: source }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  accessibilityLabel={`Votre photo : ${prouesse.titre}`}
                  onError={onError}
                />
              ) : (
                <Trace trace={TRACES.image} couleur={colors.textSecondary} taille={32} epaisseur={1.5} />
              )}
              {prouesse.type && couleurType ? (
                <Pop delai={1000} style={[styles.type, { backgroundColor: couleurType }]}>
                  <Picto nom={prouesse.type} couleur={colors.background} taille={12} />
                  <Text style={styles.texteType}>{TYPE_LABELS[prouesse.type].singulier}</Text>
                </Pop>
              ) : null}
            </View>
            <View style={styles.legende}>
              <Text style={styles.titrePhoto} numberOfLines={2}>
                {prouesse.titre}
              </Text>
              <Text style={styles.lieuPhoto}>
                {[prouesse.land ?? prouesse.parc, date].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </Animated.View>
        </View>

        <Monte delai={550} style={styles.bravo}>
          <Text style={styles.surtitre}>PROUESSE VALIDÉE</Text>
          <Text style={styles.titre} accessibilityRole="header">
            {nom ? `Bien vu, ${nom} !` : 'Bien vu !'}
          </Text>
          <Pop delai={1100} style={styles.points}>
            <Text style={styles.textePoints}>
              +{POINTS_PAR_PROUESSE} points · Score {score}
            </Text>
          </Pop>
        </Monte>

        {categorie ? (
          <Monte delai={800} style={styles.progression}>
            <View style={styles.ligneProgression}>
              <View style={styles.nomCategorie}>
                {pictoDe(categorie.nom) ? (
                  <Picto nom={categorie.nom} couleur={colors.accentSecondary} taille={16} />
                ) : null}
                <Text style={styles.texteCategorie} numberOfLines={1}>
                  {categorie.nom}
                </Text>
              </View>
              <Text style={styles.compte}>
                <Text style={styles.compteFort}>{categorie.obtenues}</Text>/{categorie.total}
              </Text>
            </View>
            <Jauge obtenues={categorie.obtenues} total={categorie.total} />
          </Monte>
        ) : null}

        <View style={styles.espace} />

        <Monte delai={1000}>
          {estLocalisee(prouesse) ? (
            <BoutonPrincipal libelle="Voir sur la carte" icone={TRACES.carte} onPress={voirSurLaCarte} />
          ) : (
            <BoutonPrincipal libelle="Continuer" onPress={fermer} fleche />
          )}
        </Monte>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenu: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  fermer: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scene: {
    height: 380,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centre: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  anneau: {
    position: 'absolute',
    left: -100,
    top: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  etincelle: {
    position: 'absolute',
  },
  polaroid: {
    width: 260,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 18,
    backgroundColor: illustration.papier,
    borderRadius: 6,
    boxShadow: '0px 18px 40px rgba(0,0,0,0.45)',
    transformOrigin: 'top',
  },
  photo: {
    height: 236,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: illustration.nuit,
    borderRadius: 3,
  },
  type: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 9,
    borderRadius: radius.pill,
  },
  texteType: {
    fontFamily: fonts.interBold,
    fontSize: 11,
    lineHeight: normalLineHeight(11),
    color: colors.background,
  },
  legende: {
    marginTop: 12,
    gap: 2,
    alignItems: 'center',
  },
  titrePhoto: {
    fontFamily: fonts.loraBold,
    fontSize: 19,
    lineHeight: 24,
    color: illustration.encre,
    textAlign: 'center',
  },
  lieuPhoto: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: illustration.encreDouce,
  },
  bravo: {
    alignItems: 'center',
    gap: 10,
  },
  surtitre: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    letterSpacing: 1.7,
    color: colors.accentSecondary,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 32,
    lineHeight: 32 * 1.12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  points: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: illustration.pastille,
    borderWidth: 1,
    borderColor: illustration.bordFort,
    borderRadius: radius.pill,
  },
  textePoints: {
    fontFamily: fonts.interBold,
    fontSize: 15,
    lineHeight: normalLineHeight(15),
    color: JAUNE,
  },
  progression: {
    marginTop: 22,
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: illustration.carte,
    borderWidth: 1,
    borderColor: illustration.bord,
    borderRadius: 18,
  },
  ligneProgression: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  nomCategorie: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  texteCategorie: {
    flexShrink: 1,
    fontFamily: fonts.interBold,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textPrimary,
  },
  compte: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textSecondary,
  },
  compteFort: {
    fontFamily: fonts.interBold,
    color: colors.textPrimary,
  },
  jauge: {
    height: 8,
    overflow: 'hidden',
    backgroundColor: illustration.jauge,
    borderRadius: 4,
  },
  remplissage: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 4,
    transformOrigin: 'left',
  },
  espace: {
    flex: 1,
    minHeight: 24,
  },
});
