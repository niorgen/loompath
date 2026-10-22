import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiniCarte } from '@/components/carte/MiniCarte';
import { HeaderTitle } from '@/components/HeaderTitle';
import { IndiceRow } from '@/components/IndiceRow';
import { MessageLocalisation } from '@/components/MessageLocalisation';
import { NAV_HEIGHT } from '@/components/NavigationMenu';
import { ProgressionRow } from '@/components/ProgressionRow';
import { ProuesseRow } from '@/components/ProuesseRow';
import { SectionHeader } from '@/components/SectionHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { StatCards } from '@/components/StatCards';
import { calculerStats, construireCarnet, TYPE_LABELS } from '@/data';
import { useLandDuJoueur, usePositionJoueur } from '@/hooks/usePositionJoueur';
import { formatDistance, useProuessesProches } from '@/hooks/useProuessesProches';
import { useProfil } from '@/state/profil';
import { useCarnet, useProuesses } from '@/state/validations';
import { colors } from '@/theme';

// Journal : deux variantes du Figma selon la localisation.
// Sans position : stats, récemment obtenus, prouesses à faire.
// Avec position : mini-carte des prouesses proches, récemment obtenus, catégories du land
// où se trouve le joueur, puis les prouesses à proximité.
export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { position, refusee, autoriser } = usePositionJoueur();
  const land = useLandDuJoueur(position);
  const proches = useProuessesProches(position, 5);
  const prouesses = useProuesses();
  const carnet = useCarnet();
  const { nom } = useProfil();
  const statsGlobales = useMemo(() => calculerStats(prouesses), [prouesses]);

  // Dernières prouesses validées, de la plus récente à la plus ancienne
  const recentes = useMemo(
    () =>
      prouesses
        .filter((p) => p.dateValidation)
        .sort((a, b) => b.dateValidation!.localeCompare(a.dateValidation!))
        .slice(0, 10),
    [prouesses],
  );

  // Sans position : quelques prouesses encore à valider, dans l'ordre du carnet
  const aFaire = useMemo(() => prouesses.filter((p) => !p.obtenue).slice(0, 5), [prouesses]);

  // Types de prouesses du land où se trouve le joueur, avec leur progression
  const categorieLand = land ? carnet.find((c) => c.niveau === 'land' && c.nom === land) : undefined;
  const typesDuLand = useMemo(
    () => (categorieLand ? construireCarnet(categorieLand.prouesses).filter((c) => c.niveau === 'type') : []),
    [categorieLand],
  );

  const recemment =
    recentes.length > 0 ? (
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
    ) : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.zoneCentrale,
          { paddingTop: insets.top + 16, paddingBottom: NAV_HEIGHT + insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeaderTitle surtitre={nom ? `Bonjour, ${nom}` : 'Bonjour'} titre="Journal" />

        {refusee ? <MessageLocalisation onAutoriser={autoriser} /> : null}

        <StatCards score={statsGlobales.score} progression={statsGlobales.progression} />

        {position ? (
          <>
            {proches.length > 0 ? (
              <MiniCarte joueur={position} prouesses={proches} onPress={() => router.navigate('/cartes')} />
            ) : null}

            {recemment}

            {categorieLand && typesDuLand.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  surtitre="Prouesses"
                  titre={`Vous êtes à ${categorieLand.nom}`}
                  onPress={() => router.push(`/prouesses/${categorieLand.id}`)}
                />
                <View style={styles.liste}>
                  {typesDuLand.map((type) => (
                    <ProgressionRow
                      key={type.id}
                      titre={type.nom}
                      obtenues={type.obtenues}
                      total={type.total}
                      onPress={() =>
                        router.push({ pathname: '/prouesses/[id]', params: { id: type.id, land: categorieLand.id } })
                      }
                    />
                  ))}
                </View>
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
          </>
        ) : (
          <>
            {recemment}

            {aFaire.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader surtitre="Prouesses" titre="A faire" onPress={() => router.navigate('/prouesses')} />
                <View style={styles.liste}>
                  {aFaire.map((prouesse) => (
                    <IndiceRow
                      key={prouesse.id}
                      titre={prouesse.titre}
                      indice={prouesse.sousTitre}
                      obtenue={false}
                      onPress={() => router.push(`/prouesse/${prouesse.id}`)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
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
