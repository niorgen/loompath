import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState, type ReactNode } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { BoutonPrincipal } from '@/components/BoutonPrincipal';
import { ChampNom } from '@/components/ChampNom';
import { FondNuit } from '@/components/Fonds';
import {
  SceneBienvenue,
  SceneChoisir,
  SceneLocalisation,
  ScenePhotographier,
  ScenePhotos,
  SceneSouvenirs,
} from '@/components/onboarding/Scenes';
import { Trace, TRACES } from '@/components/Picto';
import { PICTOS } from '@/data/pictos';
import { useTitrePage } from '@/hooks/useTitrePage';
import { definirNom, nomValide, terminerIntroduction, useProfil } from '@/state/profil';
import { colors, fonts, illustration, normalLineHeight } from '@/theme';

// Introduction du premier lancement (artifact « Design ») : bienvenue, comment ça marche
// en trois écrans, nom du joueur, puis les deux autorisations.
const ETAPES = 7;
const ETAPE_NOM = 4;
const ETAPE_LOCALISATION = 5;

const JAUNE = PICTOS.Secret.couleur;
const VERT = PICTOS['Point photo'].couleur;

export default function OnboardingScreen() {
  useTitrePage('Introduction');
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

  // Appareil photo puis pellicule : les deux servent à valider une prouesse
  const autoriserPhotos = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    } catch {
      // Indisponible : redemandé à la première validation
    }
    terminerIntroduction();
  };

  // En haut à droite : les écrans de présentation mènent au nom (seule information obligatoire),
  // la localisation aux photos, et les photos peuvent attendre
  const raccourci =
    etape < ETAPE_NOM
      ? { libelle: 'Passer', onPress: () => setEtape(ETAPE_NOM) }
      : etape === ETAPE_LOCALISATION
        ? { libelle: 'Passer', onPress: suivante }
        : etape === ETAPES - 1
          ? { libelle: 'Plus tard', onPress: terminerIntroduction }
          : undefined;

  const ecrans: { contenu: ReactNode; actions: ReactNode }[] = [
    {
      contenu: <Bienvenue />,
      actions: <BoutonPrincipal libelle="Commencer" onPress={suivante} fleche />,
    },
    {
      contenu: (
        <Presentation
          scene={<SceneChoisir />}
          surtitre="Comment ça marche · 1/3"
          couleurSurtitre={JAUNE}
          titre="Choisissez une prouesse près de vous"
          texte="Une prouesse ? Un petit défi à relever ! Filer dans une attraction, saluer un personnage, dénicher le détail que tout le monde rate… Suivez l'indice, on vous met sur la piste."
        />
      ),
      actions: <BoutonPrincipal libelle="Suivant" onPress={suivante} fleche />,
    },
    {
      contenu: (
        <Presentation
          scene={<ScenePhotographier />}
          surtitre="Comment ça marche · 2/3"
          couleurSurtitre={VERT}
          titre="Prenez la photo sur place"
          texte="Vous y êtes ? Sortez votre téléphone et prenez la photo ! Seul, en bande ou juste le décor : c'est elle qui valide la prouesse."
        />
      ),
      actions: <BoutonPrincipal libelle="Suivant" onPress={suivante} fleche />,
    },
    {
      contenu: (
        <Presentation
          scene={<SceneSouvenirs />}
          surtitre="Comment ça marche · 3/3"
          titre="Gardez une trace de vos aventures"
          texte="Chaque photo se range sur la carte, pile là où vous l'avez prise, et dans vos Chroniques, votre carnet de visite jour après jour."
        />
      ),
      actions: <BoutonPrincipal libelle="C'est parti" onPress={suivante} fleche />,
    },
    {
      contenu: <EtapeNom nom={nom} onChange={setNom} onValider={validerNom} />,
      actions: nomValide(nom) ? (
        <BoutonPrincipal libelle="C'est moi" onPress={validerNom} fleche />
      ) : (
        <BoutonPrincipal libelle="Entrez au moins 2 caractères" onPress={validerNom} disabled />
      ),
    },
    {
      contenu: (
        <Presentation
          scene={<SceneLocalisation />}
          surtitre="Autorisation 1 sur 2"
          titre="Trouvez les prouesses autour de vous"
          texte="Loompath utilise votre position seulement quand l'app est ouverte."
        >
          <Avantages
            couleur={colors.accentSecondary}
            elements={[
              'Voir les prouesses les plus proches en premier',
              'Connaître la distance et le temps à pied',
            ]}
          />
        </Presentation>
      ),
      actions: (
        <>
          <NoteProfil />
          <BoutonPrincipal libelle="Autoriser la localisation" onPress={autoriserLocalisation} />
        </>
      ),
    },
    {
      contenu: (
        <Presentation
          scene={<ScenePhotos />}
          surtitre="Autorisation 2 sur 2"
          couleurSurtitre={VERT}
          titre="Immortalisez chaque découverte"
          texte="Prenez la photo sur place ou choisissez-la dans votre pellicule : elle valide la prouesse."
        >
          <Avantages
            couleur={VERT}
            elements={[
              'Selfie, photo du décor ou de groupe : à vous de choisir',
              'Importez une photo déjà prise depuis votre pellicule',
              'Vos photos restent privées, sauf si vous les partagez',
            ]}
          />
        </Presentation>
      ),
      actions: (
        <>
          <NoteProfil />
          <BoutonPrincipal libelle="Autoriser l'accès aux photos" onPress={autoriserPhotos} />
        </>
      ),
    },
  ];

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FondNuit variante="scene" />
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
          {raccourci ? (
            <Pressable
              onPress={raccourci.onPress}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.caseBarre, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.raccourci}>{raccourci.libelle}</Text>
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
  surtitre: string;
  couleurSurtitre?: string;
  titre: string;
  texte: string;
  grand?: boolean;
}) {
  return (
    <View style={[styles.entete, grand && styles.enteteGrand]}>
      <Text style={[styles.surtitre, { color: couleurSurtitre }]}>{surtitre.toUpperCase()}</Text>
      <Text style={[styles.titre, grand && styles.titreGrand]} accessibilityRole="header">
        {titre}
      </Text>
      <Text style={styles.texte}>{texte}</Text>
    </View>
  );
}

// Écran 1 : polaroïds au-dessus du message d'accueil, calé en bas
function Bienvenue() {
  return (
    <View style={styles.bienvenue}>
      <SceneBienvenue />
      <View style={styles.accueil}>
        <Entete
          surtitre="Bienvenue sur Loompath"
          titre="Le parc a des secrets. Partez les trouver."
          texte="Loompath vous guide dans le parc pour relever des prouesses et garder un souvenir de chacune."
          grand
        />
      </View>
    </View>
  );
}

// Écrans 2 à 4, 6 et 7 : illustration, en-tête, puis éventuellement la liste des avantages
function Presentation({
  scene,
  children,
  ...entete
}: {
  scene: ReactNode;
  surtitre: string;
  couleurSurtitre?: string;
  titre: string;
  texte: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.presentation}>
      <View style={styles.scene}>{scene}</View>
      <Entete {...entete} />
      {children}
    </View>
  );
}

// Écran 5 : nom du joueur, avec aperçu de l'accueil du Journal
function EtapeNom({ nom, onChange, onValider }: { nom: string; onChange: (nom: string) => void; onValider: () => void }) {
  const affiche = nom.trim() ? nom.trim().toUpperCase() : 'VOTRE NOM';
  return (
    <View style={styles.etapeNom}>
      <Entete
        surtitre="Votre profil"
        titre="Comment doit-on vous appeler ?"
        texte="Il signe votre journal et tous vos souvenirs."
      />
      <Avatar nom={nom} />
      <ChampNom valeur={nom} onChange={onChange} onValider={onValider} />
      <View style={styles.apercu} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.libelleApercu}>Aperçu</Text>
        <Text style={styles.surtitre}>BONJOUR, {affiche}</Text>
        <Text style={styles.titreApercu}>Journal de voyage</Text>
      </View>
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

function NoteProfil() {
  return (
    <View style={styles.note}>
      <Trace trace={TRACES.cadenas} couleur={colors.textSecondary} taille={14} epaisseur={2} />
      <Text style={styles.texteNote}>Modifiable à tout moment dans Profil</Text>
    </View>
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
  raccourci: {
    fontFamily: fonts.interBold,
    fontSize: 14,
    lineHeight: normalLineHeight(14),
    color: colors.textSecondary,
  },
  points: {
    flexDirection: 'row',
    gap: 5,
  },
  point: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: illustration.bord,
  },
  pointCourant: {
    width: 20,
  },
  pointAtteint: {
    backgroundColor: colors.accentSecondary,
  },
  defilement: {
    flex: 1,
  },
  contenu: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  actions: {
    gap: 14,
  },
  entete: {
    gap: 10,
  },
  enteteGrand: {
    gap: 14,
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
    fontSize: 28,
    lineHeight: 28 * 1.15,
    color: colors.textPrimary,
  },
  titreGrand: {
    fontSize: 34,
    lineHeight: 34 * 1.12,
  },
  texte: {
    fontFamily: fonts.interRegular,
    fontSize: 16,
    lineHeight: 16 * 1.55,
    color: illustration.texteDoux,
  },
  // Écran 1
  bienvenue: {
    flex: 1,
    paddingTop: 8,
  },
  accueil: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 24,
    paddingBottom: 8,
  },
  // Écrans de présentation et d'autorisation
  presentation: {
    gap: 20,
  },
  scene: {
    marginTop: 18,
    marginBottom: 2,
  },
  // Écran 5
  etapeNom: {
    gap: 24,
    paddingTop: 28,
  },
  apercu: {
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: illustration.carte,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: illustration.bord,
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
  // Écrans 6 et 7
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
    backgroundColor: illustration.pastille,
    borderRadius: 12,
  },
  texteAvantage: {
    flex: 1,
    fontFamily: fonts.interRegular,
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: illustration.texteListe,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  texteNote: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textSecondary,
  },
});
