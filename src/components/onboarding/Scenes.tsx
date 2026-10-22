import type { ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Etincelle, Picto, Trace, TRACES } from '@/components/Picto';
import { PICTOS } from '@/data/pictos';
import { colors, fonts, illustration, normalLineHeight, radius } from '@/theme';

// Illustrations de l'introduction (artifact « Design », écrans de 390 px avec 24 px de marge)
const LARGEUR = 342;

const JAUNE = PICTOS.Secret.couleur;
const VERT = PICTOS['Point photo'].couleur;
const ROSE = PICTOS['Mickeys cachés'].couleur;
const LAVANDE = colors.accentSecondary;

// Scène dessinée pour 342 px, réduite sur les écrans plus étroits
function Scene({ hauteur, children }: { hauteur: number; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const echelle = Math.min(1, (width - 48) / LARGEUR);
  return (
    <View
      style={{ height: hauteur * echelle }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={{
          width: LARGEUR,
          height: hauteur,
          alignSelf: 'center',
          transformOrigin: 'top',
          transform: [{ scale: echelle }],
        }}
      >
        {children}
      </View>
    </View>
  );
}

const en = (left: number, top: number, extra?: ViewStyle): ViewStyle => ({ position: 'absolute', left, top, ...extra });

function Polaroid({
  style,
  largeur,
  hauteurPhoto,
  titre,
  sousTitre,
  children,
}: {
  style: ViewStyle;
  largeur: number;
  hauteurPhoto: number;
  titre: string;
  sousTitre: string;
  children: ReactNode;
}) {
  return (
    <View style={[styles.polaroid, { width: largeur }, style]}>
      <View style={[styles.photoPolaroid, { height: hauteurPhoto }]}>{children}</View>
      <View style={styles.legendePolaroid}>
        <Text style={styles.titrePolaroid}>{titre}</Text>
        <Text style={styles.sousTitrePolaroid}>{sousTitre}</Text>
      </View>
    </View>
  );
}

const aujourdhui = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

// 1 · Bienvenue : deux polaroïds, un secret découvert et la photo du joueur
export function SceneBienvenue() {
  return (
    <Scene hauteur={290}>
      <Polaroid
        style={en(14, 40, { transform: [{ rotate: '-7deg' }] })}
        largeur={150}
        hauteurPhoto={130}
        titre="Le détail caché"
        sousTitre="Main Street U.S.A."
      >
        <Picto nom="Secret" taille={34} />
        <Text style={[styles.textePhoto, { color: JAUNE }]}>Secret découvert</Text>
      </Polaroid>
      <Polaroid
        style={en(142, 14, { transform: [{ rotate: '5deg' }] })}
        largeur={190}
        hauteurPhoto={190}
        titre="Mon souvenir"
        sousTitre={`Souvenir du ${aujourdhui()}`}
      >
        <Trace trace={TRACES.groupe} couleur={VERT} taille={40} epaisseur={1.6} />
        <Text style={[styles.textePhoto, styles.textePhotoJoueur]}>Votre photo</Text>
      </Polaroid>
      <View style={en(40, 6)}>
        <Etincelle couleur={LAVANDE} taille={18} />
      </View>
      <View style={en(320, 240)}>
        <Etincelle couleur={JAUNE} taille={22} />
      </View>
      <View style={en(20, 236)}>
        <Etincelle couleur={ROSE} taille={12} />
      </View>
      <View style={en(118, 248)}>
        <Etincelle couleur={VERT} taille={14} />
      </View>
    </Scene>
  );
}

// 2 · Choisissez : pile de prouesses proches, puis la rangée des types
const PILE = [
  { type: 'Spectacles', libelle: 'Spectacle', distance: '450 m', top: 0, echelle: 0.86, opacite: 0.45 },
  { type: 'Attraction', libelle: 'Attraction', distance: '300 m', top: 26, echelle: 0.93, opacite: 0.7 },
  { type: 'Secret', libelle: 'Secret', distance: '120 m', top: 58, echelle: 1, opacite: 1 },
] as const;

const TYPES = ['Attraction', 'Spectacles', 'Personnages', 'Secret', 'Mickeys cachés', 'Point photo', 'Chasse au trésor'];

export function SceneChoisir() {
  return (
    <Scene hauteur={190}>
      {PILE.map(({ type, libelle, distance, top, echelle, opacite }, i) => {
        const devant = i === PILE.length - 1;
        const couleur = PICTOS[type].couleur;
        return (
          <View
            key={type}
            style={[
              styles.prouesse,
              { top, opacity: opacite, transform: [{ scale: echelle }] },
              devant && { backgroundColor: illustration.nuit, borderColor: couleur },
            ]}
          >
            <View style={styles.iconeProuesse}>
              <Picto nom={type} taille={20} />
            </View>
            <View style={styles.texteProuesse}>
              <Text style={[styles.libelleProuesse, { color: couleur }]}>{libelle}</Text>
              <View style={styles.ligneProuesse} />
            </View>
            <Text style={styles.distance}>{distance}</Text>
          </View>
        );
      })}
      <View style={{ position: 'absolute', right: 6, top: 66 }}>
        <Etincelle couleur={JAUNE} taille={22} />
      </View>
      <View style={styles.types}>
        {TYPES.map((type) => (
          <View key={type} style={styles.pastilleType}>
            <Picto nom={type} taille={16} />
          </View>
        ))}
      </View>
    </Scene>
  );
}

// Silhouettes de la photo « Trouvé ! »
const PHOTO_TROUVE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 184" fill="none"><rect width="220" height="184" fill="${illustration.nuit}"/><path d="M110 42L115.6 56.4L130 62L115.6 67.6L110 82L104.4 67.6L90 62L104.4 56.4Z" fill="${JAUNE}"/><circle cx="78" cy="140" r="16" fill="#4B5596"/><path d="M44 196a34 34 0 0 1 68 0Z" fill="#4B5596"/><circle cx="144" cy="136" r="17" fill="#3A4580"/><path d="M108 196a36 36 0 0 1 72 0Z" fill="#3A4580"/></svg>`;

// 3 · Photographiez : polaroïd validé et points gagnés
export function ScenePhotographier() {
  const centre = LARGEUR / 2;
  return (
    <Scene hauteur={190}>
      <View style={[styles.polaroid, styles.polaroidTrouve, en(centre - 75, 4)]}>
        <View style={styles.photoTrouve}>
          <SvgXml xml={PHOTO_TROUVE} width={134} height={112} />
        </View>
        <Text style={styles.legendeTrouve}>Trouvé !</Text>
      </View>
      <View style={[styles.validee, en(centre + 30, 0)]}>
        <Trace trace={TRACES.coche} couleur={colors.background} taille={14} epaisseur={2.6} />
        <Text style={styles.texteValidee}>Validée</Text>
      </View>
      <View style={[styles.points, en(centre - 150, 70)]}>
        <Text style={styles.textePoints}>+10 pts</Text>
      </View>
      <View style={en(centre + 92, 92)}>
        <Etincelle couleur={ROSE} taille={18} />
      </View>
      <View style={en(centre - 104, 22)}>
        <Etincelle couleur={LAVANDE} taille={14} />
      </View>
    </Scene>
  );
}

const PLAN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><path d="M-10 112C36 94 56 130 92 102S146 56 172 64" stroke="${illustration.piste}" stroke-width="10" stroke-linecap="round"/><path d="M54 -10C64 36 36 64 64 92S82 138 74 172" stroke="#1C2450" stroke-width="8" stroke-linecap="round"/><path d="M43 52C70 70 96 70 101 88S74 112 59 122" stroke="${LAVANDE}" stroke-width="2.5" stroke-dasharray="0.1 7" stroke-linecap="round"/></svg>`;

const REPERES = [
  { type: 'Secret', x: 28, y: 30 },
  { type: 'Point photo', x: 86, y: 66 },
  { type: 'Attraction', x: 44, y: 104 },
] as const;

const SOUVENIRS = ['Secret', 'Point photo', 'Attraction', 'Personnages'];

// 4 · Gardez une trace : la carte et les Chroniques du jour
export function SceneSouvenirs() {
  return (
    <Scene hauteur={190}>
      <View style={[styles.plan, en(8, 10)]}>
        <SvgXml xml={PLAN} width={160} height={160} />
        {REPERES.map(({ type, x, y }) => (
          <View key={type} style={[styles.repere, en(x, y, { backgroundColor: PICTOS[type].couleur })]}>
            <View style={{ transform: [{ rotate: '45deg' }] }}>
              <Trace trace={PICTOS[type].trace} couleur={colors.background} taille={14} epaisseur={2.2} />
            </View>
          </View>
        ))}
        <View style={styles.etiquettePlan}>
          <Trace trace={TRACES.carte} couleur={LAVANDE} taille={13} />
          <Text style={styles.texteEtiquettePlan}>Carte</Text>
        </View>
      </View>
      <View style={styles.journee}>
        <View style={styles.enteteJournee}>
          <Text style={styles.titreJournee}>Aujourd’hui</Text>
          <Trace trace={TRACES.carnet} couleur={LAVANDE} taille={14} />
        </View>
        <View style={styles.grilleJournee}>
          {SOUVENIRS.map((type) => (
            <View key={type} style={styles.souvenir}>
              <Picto nom={type} taille={16} />
            </View>
          ))}
        </View>
        <Text style={styles.piedJournee}>4 souvenirs · Chroniques</Text>
      </View>
    </Scene>
  );
}

// Cercles concentriques autour de l'icône d'une autorisation
function Halo({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <Scene hauteur={190}>
      <View style={styles.halo}>
        <View style={[styles.cercle, styles.cercleExterieur]} />
        <View style={[styles.cercle, styles.cercleInterieur]} />
        <View style={styles.tuileHalo}>{icone}</View>
      </View>
      {children}
    </Scene>
  );
}

// 6 · Localisation
export function SceneLocalisation() {
  return (
    <Halo icone={<Trace trace={TRACES.repere} couleur={LAVANDE} taille={48} epaisseur={1.6} />}>
      <View style={[styles.etiquette, styles.etiquetteDistance, { right: 10, top: 8 }]}>
        <View style={styles.pastilleEtiquette}>
          <Picto nom="Secret" taille={16} />
        </View>
        <Text style={styles.texteEtiquette}>Secret à 120 m</Text>
      </View>
      <View style={[styles.etiquette, styles.puce, { left: 14, bottom: 12 }]}>
        <Picto nom="Point photo" taille={14} />
        <Text style={[styles.texteEtiquette, styles.texteEtiquetteDoux]}>3 min à pied</Text>
      </View>
    </Halo>
  );
}

// 7 · Appareil photo et pellicule
export function ScenePhotos() {
  return (
    <Halo icone={<Picto nom="Point photo" taille={48} />}>
      <View style={styles.photoPenchee}>
        <Picto nom="Point photo" couleur={illustration.inactif} taille={20} />
      </View>
      <View style={[styles.etiquette, styles.puce, { left: 10, top: 4 }]}>
        <Trace trace={TRACES.pellicule} couleur={LAVANDE} taille={14} epaisseur={2} />
        <Text style={styles.texteEtiquette}>Pellicule</Text>
      </View>
      <View style={[styles.etiquette, styles.puce, { left: 14, bottom: 10 }]}>
        <Trace trace={TRACES.coche} couleur={VERT} taille={14} epaisseur={2.4} />
        <Text style={styles.texteEtiquette}>Prouesse validée</Text>
      </View>
    </Halo>
  );
}

const styles = StyleSheet.create({
  polaroid: {
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: illustration.papier,
    borderRadius: 6,
    boxShadow: '0px 14px 30px rgba(0,0,0,0.45)',
  },
  photoPolaroid: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: illustration.nuit,
    borderRadius: 3,
  },
  legendePolaroid: {
    marginTop: 8,
    gap: 1,
  },
  titrePolaroid: {
    fontFamily: fonts.loraBold,
    fontSize: 14,
    lineHeight: 18,
    color: illustration.encre,
  },
  sousTitrePolaroid: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: illustration.encreDouce,
  },
  textePhoto: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
  },
  textePhotoJoueur: {
    fontFamily: fonts.interRegular,
    fontSize: 11,
    lineHeight: normalLineHeight(11),
    color: illustration.texteListe,
  },
  // 2
  prouesse: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 10,
    paddingRight: 14,
    backgroundColor: illustration.carte,
    borderWidth: 1.5,
    borderColor: illustration.bord,
    borderRadius: 18,
    transformOrigin: 'top',
  },
  iconeProuesse: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: illustration.piste,
    borderRadius: 13,
  },
  texteProuesse: {
    flex: 1,
    gap: 7,
  },
  libelleProuesse: {
    fontFamily: fonts.interBold,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
  },
  ligneProuesse: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2F3A73',
  },
  distance: {
    fontFamily: fonts.interBold,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textPrimary,
  },
  types: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 146,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  pastilleType: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: illustration.carte,
    borderWidth: 1,
    borderColor: illustration.bord,
    borderRadius: 17,
  },
  // 3
  polaroidTrouve: {
    width: 150,
    paddingBottom: 30,
    transform: [{ rotate: '-4deg' }],
    boxShadow: '0px 16px 34px rgba(0,0,0,0.5)',
  },
  photoTrouve: {
    height: 112,
    overflow: 'hidden',
    borderRadius: 3,
  },
  legendeTrouve: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    fontFamily: fonts.loraBold,
    fontSize: 13,
    lineHeight: 17,
    color: illustration.encre,
  },
  validee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingLeft: 7,
    paddingRight: 11,
    backgroundColor: VERT,
    borderRadius: radius.pill,
    transform: [{ rotate: '4deg' }],
  },
  texteValidee: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.background,
  },
  points: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    backgroundColor: illustration.pastille,
    borderWidth: 1,
    borderColor: illustration.bordFort,
    borderRadius: radius.pill,
    transform: [{ rotate: '-6deg' }],
  },
  textePoints: {
    fontFamily: fonts.interBold,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: JAUNE,
  },
  // 4
  plan: {
    width: 160,
    height: 160,
    overflow: 'hidden',
    backgroundColor: illustration.carte,
    borderWidth: 1,
    borderColor: illustration.bord,
    borderRadius: 22,
    transform: [{ rotate: '-3deg' }],
  },
  repere: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 4,
    transform: [{ rotate: '-45deg' }],
  },
  etiquettePlan: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 9,
    backgroundColor: illustration.nuit,
    borderRadius: radius.pill,
  },
  texteEtiquettePlan: {
    fontFamily: fonts.interBold,
    fontSize: 11,
    lineHeight: normalLineHeight(11),
    color: colors.textPrimary,
  },
  journee: {
    position: 'absolute',
    right: 8,
    top: 12,
    width: 156,
    gap: 10,
    padding: 12,
    backgroundColor: illustration.carte,
    borderWidth: 1,
    borderColor: illustration.bord,
    borderRadius: 20,
    transform: [{ rotate: '3deg' }],
    boxShadow: '0px 14px 30px rgba(0,0,0,0.45)',
  },
  enteteJournee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titreJournee: {
    fontFamily: fonts.loraBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  grilleJournee: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  souvenir: {
    width: 62,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: illustration.nuit,
    borderRadius: 8,
  },
  piedJournee: {
    fontFamily: fonts.interRegular,
    fontSize: 11,
    lineHeight: normalLineHeight(11),
    color: colors.textSecondary,
  },
  // 6 et 7
  halo: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cercle: {
    position: 'absolute',
    borderWidth: 1,
  },
  cercleExterieur: {
    width: 186,
    height: 186,
    borderRadius: 93,
    borderColor: '#1C2450',
  },
  cercleInterieur: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderColor: illustration.bord,
  },
  tuileHalo: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: illustration.carte,
    borderWidth: 1,
    borderColor: illustration.bord,
    borderRadius: 28,
  },
  etiquette: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: illustration.nuit,
    borderWidth: 1,
    borderColor: illustration.bord,
  },
  etiquetteDistance: {
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 14,
  },
  puce: {
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  pastilleEtiquette: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2F6E',
    borderRadius: 9,
  },
  texteEtiquette: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textPrimary,
  },
  texteEtiquetteDoux: {
    fontFamily: fonts.interRegular,
    color: illustration.texteListe,
  },
  photoPenchee: {
    position: 'absolute',
    right: 16,
    top: 8,
    width: 74,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: illustration.nuit,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3E4A8A',
    borderRadius: 14,
    transform: [{ rotate: '6deg' }],
  },
});
