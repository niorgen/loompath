import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderTitle } from '@/components/HeaderTitle';
import { MessageLocalisation } from '@/components/MessageLocalisation';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ProuesseRow } from '@/components/ProuesseRow';
import { SectionHeader } from '@/components/SectionHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { StatCards } from '@/components/StatCards';
import { calculerStats, journal, TYPE_LABELS } from '@/data';
import { useParcDuJoueur, usePositionJoueur } from '@/hooks/usePositionJoueur';
import { formatDistance, useProuessesProches } from '@/hooks/useProuessesProches';
import { useProuesses } from '@/state/validations';
import { colors } from '@/theme';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { position, refusee, autoriser } = usePositionJoueur();
  const parc = useParcDuJoueur(position);
  const proches = useProuessesProches(position, 5);
  const prouesses = useProuesses();
  const statsGlobales = useMemo(() => calculerStats(prouesses), [prouesses]);
  // Stats du parc où se trouve le joueur (aucune hors des parcs ou sans localisation)
  const statsParc = useMemo(() => (parc ? calculerStats(prouesses, parc) : undefined), [prouesses, parc]);

  // Dernières prouesses validées, de la plus récente à la plus ancienne
  const recentes = useMemo(
    () =>
      prouesses
        .filter((p) => p.dateValidation)
        .sort((a, b) => b.dateValidation!.localeCompare(a.dateValidation!))
        .slice(0, 10),
    [prouesses],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.zoneCentrale,
          { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeaderTitle surtitre={`Bonjour, ${journal.voyageur}`} titre="Journal" />

        {refusee ? <MessageLocalisation onAutoriser={autoriser} /> : null}

        <StatCards score={statsGlobales.score} progression={statsGlobales.progression} />
        {statsParc ? (
          <StatCards
            score={statsParc.score}
            progression={statsParc.progression}
            libelleScore={`Score\n${parc}`}
            libelleProgression={parc}
          />
        ) : null}

        {recentes.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader surtitre="Prouesses" titre="Récemment obtenus" onPress={() => router.navigate('/chroniques')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              // Les cartes débordent jusqu'au bord de l'écran, comme dans le design
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
            >
              {recentes.map((prouesse) => (
                <ServiceCard
                  key={prouesse.id}
                  badge={prouesse.type ? TYPE_LABELS[prouesse.type].singulier : (prouesse.land ?? prouesse.parc)}
                  nom={prouesse.titre}
                  // La miniature survit au nettoyage du cache photo, contrairement au fichier original
                  photo={prouesse.miniature ?? prouesse.photoUri}
                  onPress={() => router.push(`/prouesse/${prouesse.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader surtitre="Prouesses" titre="A proximités" onPress={() => router.navigate('/cartes')} />
          <View style={styles.liste}>
            {proches.map((prouesse) => (
              <ProuesseRow
                key={prouesse.id}
                titre={prouesse.titre}
                meta={prouesse.sousTitre}
                distance={formatDistance(prouesse.distanceKm)}
                onPress={() => router.push(`/prouesse/${prouesse.id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  zoneCentrale: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  carousel: {
    marginHorizontal: -16,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  liste: {
    gap: 8,
  },
});
