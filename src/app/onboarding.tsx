import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState, type ReactNode } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { BoutonAction } from '@/components/BoutonAction';
import { ChampNom } from '@/components/ChampNom';
import { Picto, Trace, TRACES } from '@/components/Picto';
import { PICTOS } from '@/data/pictos';
import { definirNom, nomValide, terminerIntroduction, useProfil } from '@/state/profil';
import { colors, fonts, normalLineHeight, radius } from '@/theme';

// Introduction du premier lancement (maquette src/data/loompath-onboarding.html) :
// bienvenue, principe, nom du joueur, puis les deux autorisations.
const ETAPES = 5;
const ETAPE_NOM = 2;

const VERT_PHOTO = PICTOS['Point photo'].couleur;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const profil = useProfil();
  const [etape, setEtape] = useState(0);
  // Revoir l'introduction depuis le Profil reprend le nom déjà choisi
  const [nom, setNom] = useState(profil.nom);

  const suivante = () => setEtape((e) => Math.min(e + 1, ETAPES - 1));
  const precedente = () => setEtape((e) => Math.max(e - 1, 0));

  // Bouton retour Android : étape précédente plutôt que quitter l'app
  useEffect(() => {
    const abonnement = BackHandler.addEventListener('hardwareBackPress', () => {
      if (etape === 0) return false;
      precedente();
      return true;
    });
    return () => abonnement.remove();
  }, [etape]);

  const validerNom = () => {
    if (!nomValide(nom)) return;
    definirNom(nom);
    suivante();
  };

  const autoriserLocalisation = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      // Localisation indisponible : on continue, le Journal proposera de l'activer
    }
    suivante();
  };

  const autoriserAppareilPhoto = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
    } catch {
      // Appareil photo indisponible : il sera redemandé à la première validation
    }
    terminerIntroduction();
  };

  // « Passer » : les écrans de présentation mènent au nom (seule information obligatoire),
  // la localisation à l'appareil photo
  const passer = etape < ETAPE_NOM ? () => setEtape(ETAPE_NOM) : etape === 3 ? suivante : undefined;

  const ecrans: { contenu: ReactNode; actions: ReactNode }[] = [
    {
      contenu: <Bienvenue />,
      actions: <BoutonAction libelle="Commencer" onPress={suivante} fleche />,
    },
    {
      contenu: <Principe />,
      actions: <BoutonAction libelle="Continuer" onPress={suivante} fleche />,
    },
    {
      contenu: <EtapeNom nom={nom} onChange={setNom} onValider={validerNom} />,
      actions: nomValide(nom) ? (
        <BoutonAction libelle="C'est moi" onPress={validerNom} fleche />
      ) : (
        <BoutonAction libelle="Entrez au moins 2 caractères" onPress={validerNom} disabled />
      ),
    },
    {
      contenu: <EtapeLocalisation />,
      actions: (
        <>
          <NoteProfil />
          <BoutonAction libelle="Autoriser la localisation" onPress={autoriserLocalisation} />
          <PlusTard onPress={suivante} />
        </>
      ),
    },
    {
      contenu: <EtapeAppareilPhoto />,
      actions: (
        <>
          <NoteProfil />
          <BoutonAction libelle="Autoriser l'appareil photo" onPress={autoriserAppareilPhoto} />
          <PlusTard onPress={terminerIntroduction} />
        </>
      ),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.cadre, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.barre}>
          {etape > 0 ? (
            <Pressable
              onPress={precedente}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              style={({ pressed }) => [styles.retour, pressed && { opacity: 0.7 }]}
            >
              <Trace trace={TRACES.retour} couleur={colors.textPrimary} taille={20} epaisseur={2} />
            </Pressable>
          ) : (
            <View style={styles.caseBarre} />
          )}
          <Points etape={etape} />
          {passer ? (
            <Pressable
              onPress={passer}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.caseBarre, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.passer}>Passer</Text>
            </Pressable>
          ) : (
            <View style={styles.caseBarre} />
          )}
        </View>

        <ScrollView
          // key : chaque étape repart du haut
          key={etape}
          style={styles.defilement}
          contentContainerStyle={styles.contenu}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {ecrans[etape].contenu}
        </ScrollView>

        <View style={styles.actions}>{ecrans[etape].actions}</View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Progression : étapes passées et courante en lavande, la courante allongée
function Points({ etape }: { etape: number }) {
  return (
    <View style={styles.points} accessibilityLabel={`Étape ${etape + 1} sur ${ETAPES}`} accessible>
      {Array.from({ length: ETAPES }, (_, i) => (
        <View
          key={i}
          style={[styles.point, i === etape && styles.pointCourant, i <= etape && styles.pointAtteint]}
        />
      ))}
    </View>
  );
}

function Entete({
  surtitre,
  couleurSurtitre = colors.accentSecondary,
  titre,
  texte,
  grand,
}: {
  surtitre?: string;
  couleurSurtitre?: string;
  titre: string;
  texte: string;
  grand?: boolean;
}) {
  return (
    <View style={styles.entete}>
      {surtitre ? <Text style={[styles.surtitre, { color: couleurSurtitre }]}>{surtitre.toUpperCase()}</Text> : null}
      <Text style={[styles.titre, grand && styles.titreGrand]} accessibilityRole="header">
        {titre}
      </Text>
      <Text style={[styles.texte, grand && styles.texteGrand]}>{texte}</Text>
    </View>
  );
}

// Tuile carrée arrondie portant une icône
function Tuile({ taille, children, style }: { taille: number; children: ReactNode; style?: object }) {
  return (
    <View style={[styles.tuile, { width: taille, height: taille, borderRadius: Math.round(taille * 0.28) }, style]}>
      {children}
    </View>
  );
}

// Écran 1 : pictos des types de prouesses éparpillés au-dessus du message d'accueil
const NUAGE: { nom: string; x: number; y: number; taille: number }[] = [
  { nom: 'Secret', x: 28, y: 10, taille: 64 },
  { nom: 'Point photo', x: 118, y: 40, taille: 76 },
  { nom: 'Mickeys cachés', x: 222, y: 6, taille: 60 },
  { nom: 'Attraction', x: 40, y: 104, taille: 72 },
  { nom: 'Personnages', x: 250, y: 92, taille: 72 },
  { nom: 'Chasse au trésor', x: 130, y: 140, taille: 64 },
  { nom: 'Spectacles', x: 226, y: 186, taille: 56 },
];

const NUAGE_LARGEUR = 326;
const NUAGE_HAUTEUR = 270;

function Bienvenue() {
  // Le nuage est dessiné pour 326 px : réduit sur les écrans plus étroits (marges de 24 px)
  const { width } = useWindowDimensions();
  const echelle = Math.min(1, (width - 48) / NUAGE_LARGEUR);
  return (
    <View style={styles.bienvenue}>
      <View style={{ height: NUAGE_HAUTEUR * echelle }}>
        <View
          // La mise à l'échelle part du centre : on remonte le nuage pour qu'il reste collé en haut
          style={[styles.nuage, { transform: [{ translateY: (NUAGE_HAUTEUR * (echelle - 1)) / 2 }, { scale: echelle }] }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.photoSouvenir}>
            <Picto nom="Point photo" couleur={colors.textSecondary} taille={20} />
            <Text style={styles.libellePhotoSouvenir}>Photo souvenir</Text>
          </View>
          {NUAGE.map(({ nom, x, y, taille }) => (
            <Tuile key={nom} taille={taille} style={{ position: 'absolute', left: x, top: y }}>
              <Picto nom={nom} taille={Math.round(taille * 0.41)} />
            </Tuile>
          ))}
        </View>
      </View>
      <View style={styles.accueil}>
        <Entete
          surtitre="Bienvenue sur Loompath"
          titre="Le parc cache des secrets. À vous de les trouver."
          texte="Détails de décor, Mickeys cachés, points photo : chaque découverte devient un souvenir dans votre carnet."
          grand
        />
      </View>
    </View>
  );
}

// Écran 2 : les trois gestes, reliés par un trait
const GESTES = [
  {
    icone: <Trace trace={TRACES.ampoule} couleur={PICTOS.Secret.couleur} taille={24} />,
    titre: 'Repérez',
    texte: "Choisissez une prouesse près de vous et suivez son indice jusqu'au bon endroit.",
  },
  {
    icone: <Picto nom="Point photo" taille={24} />,
    titre: 'Photographiez',
    texte: "Prenez la photo sur place : c'est elle qui valide la prouesse.",
  },
  {
    icone: <Trace trace={TRACES.etoile} couleur={colors.accentSecondary} taille={24} />,
    titre: 'Collectionnez',
    texte: 'Gagnez des points et retrouvez chaque souvenir dans vos Chroniques.',
  },
];

function Principe() {
  return (
    <View style={styles.principe}>
      <Entete titre="Une prouesse, trois gestes" texte="Pas besoin de tout connaître du parc : l'app vous guide." />
      <View>
        {GESTES.map((geste, i) => (
          <View key={geste.titre} style={styles.geste}>
            <View style={styles.rail}>
              <Tuile taille={52}>{geste.icone}</Tuile>
              {i < GESTES.length - 1 ? <View style={styles.trait} /> : null}
            </View>
            <View style={styles.texteGeste}>
              <Text style={styles.numeroGeste}>Étape {i + 1}</Text>
              <Text style={styles.titreGeste}>{geste.titre}</Text>
              <Text style={styles.texte}>{geste.texte}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Écran 3 : nom du joueur, avec aperçu de l'accueil du Journal
function EtapeNom({ nom, onChange, onValider }: { nom: string; onChange: (nom: string) => void; onValider: () => void }) {
  const affiche = nom.trim() ? nom.trim().toUpperCase() : 'VOTRE NOM';
  return (
    <View style={styles.etapeNom}>
      <Entete
        surtitre="Votre profil"
        titre="Comment doit-on vous appeler ?"
        texte="Ce nom signe votre journal de voyage et vos souvenirs."
      />
      <Avatar nom={nom} />
      <ChampNom valeur={nom} onChange={onChange} onValider={onValider} />
      <View style={styles.apercu} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.libelleApercu}>Aperçu</Text>
        <Text style={styles.surtitre}>BONJOUR, {affiche}</Text>
        <Text style={styles.titreApercu}>Journal</Text>
      </View>
    </View>
  );
}

// Cercles concentriques autour de l'icône d'une autorisation
function Halo({ children }: { children: ReactNode }) {
  return (
    <View style={styles.halo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.cercle, styles.cercleExterieur]} />
      <View style={[styles.cercle, styles.cercleInterieur]} />
      {children}
    </View>
  );
}

function Avantages({ elements, couleur }: { elements: string[]; couleur: string }) {
  return (
    <View style={styles.avantages}>
      {elements.map((texte) => (
        <View key={texte} style={styles.avantage}>
          <View style={styles.coche}>
            <Trace trace={TRACES.coche} couleur={couleur} taille={14} epaisseur={2.4} />
          </View>
          <Text style={styles.texteAvantage}>{texte}</Text>
        </View>
      ))}
    </View>
  );
}

// Écran 4 : localisation
function EtapeLocalisation() {
  return (
    <View style={styles.autorisation}>
      <Halo>
        <Tuile taille={104} style={styles.tuileHalo}>
          <Trace trace={TRACES.repere} couleur={colors.accentSecondary} taille={48} epaisseur={1.6} />
        </Tuile>
        <View style={[styles.etiquette, styles.etiquetteHaut]}>
          <View style={styles.pastilleEtiquette}>
            <Picto nom="Secret" taille={16} />
          </View>
          <Text style={styles.texteEtiquette}>Secret à 120 m</Text>
        </View>
        <View style={[styles.etiquette, styles.etiquetteBas]}>
          <Picto nom="Point photo" taille={14} />
          <Text style={styles.texteEtiquetteDiscret}>250 m</Text>
        </View>
      </Halo>
      <Entete
        surtitre="Autorisation 1 sur 2"
        titre="Trouvez les prouesses autour de vous"
        texte="Loompath utilise votre position seulement quand l'app est ouverte."
      />
      <Avantages
        couleur={colors.accentSecondary}
        elements={[
          'Voir les prouesses les plus proches en premier',
          'Connaître la distance jusqu’à chaque prouesse',
        ]}
      />
    </View>
  );
}

// Écran 5 : appareil photo
function EtapeAppareilPhoto() {
  return (
    <View style={styles.autorisation}>
      <Halo>
        <Tuile taille={104} style={styles.tuileHalo}>
          <Picto nom="Point photo" taille={48} />
        </Tuile>
        <View style={styles.photoPenchee}>
          <Picto nom="Point photo" couleur={colors.textSecondary} taille={20} />
        </View>
        <View style={[styles.etiquette, styles.etiquetteBas]}>
          <Trace trace={TRACES.coche} couleur={VERT_PHOTO} taille={14} epaisseur={2.4} />
          <Text style={styles.texteEtiquette}>Prouesse validée</Text>
        </View>
      </Halo>
      <Entete
        surtitre="Autorisation 2 sur 2"
        couleurSurtitre={VERT_PHOTO}
        titre="Votre photo valide la prouesse"
        texte="Chaque photo prise sur place devient un souvenir dans vos Chroniques."
      />
      <Avantages
        couleur={VERT_PHOTO}
        elements={[
          'Valider une prouesse en un geste',
          'Garder un carnet photo de chaque visite',
          'Vos photos restent privées, sauf si vous les partagez',
        ]}
      />
    </View>
  );
}

function NoteProfil() {
  return (
    <View style={styles.note}>
      <Trace trace={TRACES.cadenas} couleur={colors.textSecondary} taille={14} epaisseur={2} />
      <Text style={styles.texteNote}>Modifiable à tout moment dans Profil</Text>
    </View>
  );
}

function PlusTard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.plusTard, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.passer}>Plus tard</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cadre: {
    flex: 1,
    paddingHorizontal: 24,
  },
  barre: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caseBarre: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  retour: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passer: {
    fontFamily: fonts.interBold,
    fontSize: 14,
    lineHeight: normalLineHeight(14),
    color: colors.textSecondary,
  },
  points: {
    flexDirection: 'row',
    gap: 6,
  },
  point: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderSubtle,
  },
  pointCourant: {
    width: 22,
  },
  pointAtteint: {
    backgroundColor: colors.accentSecondary,
  },
  defilement: {
    flex: 1,
  },
  contenu: {
    flexGrow: 1,
    paddingTop: 28,
    paddingBottom: 24,
  },
  actions: {
    gap: 8,
  },
  entete: {
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
    fontSize: 30,
    lineHeight: 30 * 1.15,
    color: colors.textPrimary,
  },
  titreGrand: {
    fontSize: 34,
    lineHeight: 34 * 1.12,
  },
  texte: {
    fontFamily: fonts.interRegular,
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: colors.textSecondary,
  },
  texteGrand: {
    fontSize: 16,
    lineHeight: 16 * 1.55,
  },
  tuile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRow,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  // Écran 1
  bienvenue: {
    flex: 1,
    gap: 24,
  },
  nuage: {
    width: NUAGE_LARGEUR,
    height: NUAGE_HAUTEUR,
    alignSelf: 'center',
  },
  photoSouvenir: {
    position: 'absolute',
    left: 30,
    top: 196,
    width: 150,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surfaceRow,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
  },
  libellePhotoSouvenir: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textSecondary,
  },
  accueil: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Écran 2
  principe: {
    gap: 32,
  },
  geste: {
    flexDirection: 'row',
    gap: 16,
  },
  rail: {
    alignItems: 'center',
  },
  trait: {
    flex: 1,
    width: 2,
    marginVertical: 6,
    backgroundColor: colors.borderSubtle,
  },
  texteGeste: {
    flex: 1,
    gap: 6,
    paddingTop: 4,
    paddingBottom: 26,
  },
  numeroGeste: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textSecondary,
  },
  titreGeste: {
    fontFamily: fonts.loraBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  // Écran 3
  etapeNom: {
    gap: 24,
  },
  apercu: {
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.surfaceRow,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderSubtle,
    borderRadius: 18,
  },
  libelleApercu: {
    fontFamily: fonts.interBold,
    fontSize: 11,
    lineHeight: normalLineHeight(11),
    color: colors.textSecondary,
  },
  titreApercu: {
    fontFamily: fonts.loraBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  // Écrans 4 et 5
  autorisation: {
    gap: 22,
  },
  halo: {
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cercle: {
    position: 'absolute',
    borderWidth: 1,
  },
  cercleExterieur: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderColor: colors.surfaceRaised,
  },
  cercleInterieur: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderColor: colors.borderSubtle,
  },
  tuileHalo: {
    borderRadius: 32,
  },
  etiquette: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  etiquetteHaut: {
    right: 18,
    top: 26,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 14,
  },
  etiquetteBas: {
    left: 22,
    bottom: 28,
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
    backgroundColor: colors.surfacePlaceholder,
    borderRadius: 9,
  },
  texteEtiquette: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textPrimary,
  },
  texteEtiquetteDiscret: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textPrimaryAlt,
  },
  photoPenchee: {
    position: 'absolute',
    right: 22,
    top: 22,
    width: 74,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 14,
    transform: [{ rotate: '6deg' }],
  },
  avantages: {
    gap: 12,
  },
  avantage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  coche: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
  },
  texteAvantage: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: colors.textPrimaryAlt,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  texteNote: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textSecondary,
  },
  plusTard: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
