import Constants from 'expo-constants';
import { useMemo, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { BoutonAction } from '@/components/BoutonAction';
import { ChampNom } from '@/components/ChampNom';
import { confirmer } from '@/components/confirmer';
import { HeaderTitle } from '@/components/HeaderTitle';
import { ListRow } from '@/components/ListRow';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { Picto, Trace, TRACES } from '@/components/Picto';
import { StatCards } from '@/components/StatCards';
import { calculerStats, compterSouvenirs, compterVisites } from '@/data';
import { useAutorisations, type Autorisation } from '@/hooks/useAutorisations';
import { definirNom, effacerProfil, nomValide, revoirIntroduction, useProfil } from '@/state/profil';
import { effacerValidations, useProuesses } from '@/state/validations';
import { colors, fonts, normalLineHeight } from '@/theme';

const ETATS = {
  autorisee: 'Autorisée',
  refusee: 'Refusée',
  'non-demandee': 'Pas encore demandée',
} as const;

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const { nom } = useProfil();
  const prouesses = useProuesses();
  const { localisation, appareilPhoto } = useAutorisations();
  // Nom en cours de modification (undefined hors édition)
  const [brouillon, setBrouillon] = useState<string>();

  const stats = useMemo(() => calculerStats(prouesses), [prouesses]);
  const validees = useMemo(() => prouesses.filter((p) => p.obtenue), [prouesses]);
  const visites = compterVisites(validees);

  const enregistrerNom = () => {
    if (brouillon === undefined || !nomValide(brouillon)) return;
    definirNom(brouillon);
    setBrouillon(undefined);
  };

  const toutEffacer = async () => {
    const ok = await confirmer(
      'Tout effacer ?',
      'Votre nom, vos prouesses validées et leurs photos seront supprimés de cet appareil. Cette action est définitive.',
      'Tout effacer',
    );
    if (!ok) return;
    await effacerValidations();
    // Sans profil, l'app repart sur l'introduction
    await effacerProfil();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.contenu, { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <HeaderTitle titre="Profil" />

      {/* Identité */}
      <View style={styles.identite}>
        <Avatar nom={brouillon ?? nom} taille={72} />
        {brouillon === undefined ? (
          <>
            <Text style={styles.nom}>{nom || 'Joueur sans nom'}</Text>
            <Pressable
              onPress={() => setBrouillon(nom)}
              accessibilityRole="button"
              accessibilityLabel="Modifier le nom du joueur"
              hitSlop={8}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text style={styles.lien}>Modifier</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.edition}>
            <ChampNom valeur={brouillon} onChange={setBrouillon} onValider={enregistrerNom} autoFocus />
            <BoutonAction
              libelle={nomValide(brouillon) ? 'Enregistrer' : 'Entrez au moins 2 caractères'}
              onPress={enregistrerNom}
              disabled={!nomValide(brouillon)}
            />
            <Pressable
              onPress={() => setBrouillon(undefined)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.annuler, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.texteDiscret}>Annuler</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Section titre="Mes chiffres">
        <StatCards score={stats.score} progression={stats.progression} />
        <Text style={styles.resume}>
          {compterSouvenirs(validees.length)} · {visites} visite{visites > 1 ? 's' : ''} au parc
        </Text>
      </Section>

      <Section titre="Autorisations">
        <LigneAutorisation
          titre="Localisation"
          usage="Prouesses proches, distances, position de vos photos"
          icone={<Trace trace={TRACES.repere} couleur={colors.accentSecondary} taille={20} />}
          autorisation={localisation}
        />
        <LigneAutorisation
          titre="Appareil photo"
          usage="Valider les prouesses en les photographiant"
          icone={<Picto nom="Point photo" taille={20} />}
          autorisation={appareilPhoto}
        />
      </Section>

      <Section titre="Mon carnet">
        <ListRow
          onPress={revoirIntroduction}
          accessibilityLabel="Revoir l'introduction"
          icone={<Trace trace={TRACES.etoile} couleur={colors.accentSecondary} taille={20} />}
          trailing={<Trace trace={TRACES.suivant} couleur={colors.textSecondary} taille={16} epaisseur={2} />}
        >
          <Text style={styles.titreLigne}>Revoir l’introduction</Text>
          <Text style={styles.texteDiscret}>Votre nom et vos prouesses sont conservés</Text>
        </ListRow>
        <ListRow
          onPress={toutEffacer}
          accessibilityLabel="Tout effacer"
          icone={<Trace trace={TRACES.cadenas} couleur={colors.textSecondary} taille={20} />}
        >
          <Text style={styles.titreLigne}>Tout effacer</Text>
          <Text style={styles.texteDiscret}>Nom, prouesses et photos de cet appareil</Text>
        </ListRow>
      </Section>

      <Text style={styles.pied}>
        Loompath {Constants.expoConfig?.version ?? ''}
        {'\n'}Carte © OpenStreetMap · CARTO
      </Text>
    </ScrollView>
  );
}

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.titreSection} accessibilityRole="header">
        {titre}
      </Text>
      {children}
    </View>
  );
}

type LigneAutorisationProps = {
  titre: string;
  usage: string;
  icone: ReactNode;
  autorisation: Autorisation;
};

// État d'une autorisation et l'action possible : la demander, ou ouvrir les réglages si le système ne la propose plus
function LigneAutorisation({ titre, usage, icone, autorisation }: LigneAutorisationProps) {
  const { etat, bloquee, demander } = autorisation;
  const web = Platform.OS === 'web';
  const action = etat === 'autorisee' ? undefined : bloquee ? (web ? undefined : 'Réglages') : 'Autoriser';
  // Sur le web, une autorisation bloquée se rétablit dans le navigateur, hors de portée de l'app
  const detail =
    bloquee && web ? 'Réactivez-la dans les réglages du site de votre navigateur' : usage;

  return (
    <ListRow
      onPress={action ? demander : undefined}
      accessibilityLabel={`${titre}, ${ETATS[etat]}${action ? `, ${action}` : ''}`}
      icone={icone}
      trailing={action ? <Text style={styles.lien}>{action}</Text> : null}
    >
      <View style={styles.enteteLigne}>
        <Text style={styles.titreLigne}>{titre}</Text>
        <Text style={[styles.etat, etat === 'autorisee' && styles.etatAutorise]}>{ETATS[etat]}</Text>
      </View>
      <Text style={styles.texteDiscret}>{detail}</Text>
    </ListRow>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenu: {
    paddingHorizontal: 16,
    gap: 24,
  },
  identite: {
    alignItems: 'center',
    gap: 12,
  },
  nom: {
    fontFamily: fonts.loraBold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  lien: {
    fontFamily: fonts.interBold,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.accent,
  },
  edition: {
    alignSelf: 'stretch',
    gap: 12,
  },
  annuler: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 12,
  },
  titreSection: {
    fontFamily: fonts.loraBold,
    fontSize: 23,
    lineHeight: 23 * 1.1,
    color: colors.textPrimaryAlt,
  },
  resume: {
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: normalLineHeight(13),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  enteteLigne: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  titreLigne: {
    fontFamily: fonts.loraBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  etat: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    lineHeight: normalLineHeight(10),
    color: colors.textSecondary,
  },
  etatAutorise: {
    color: colors.accent,
  },
  texteDiscret: {
    fontFamily: fonts.interRegular,
    fontSize: 12,
    lineHeight: normalLineHeight(12),
    color: colors.textSecondary,
  },
  pied: {
    fontFamily: fonts.interRegular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textNavInactive,
    textAlign: 'center',
  },
});
