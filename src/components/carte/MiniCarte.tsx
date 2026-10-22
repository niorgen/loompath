import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CarteLeaflet } from '@/components/carte/CarteLeaflet';
import type { DonneesCarte } from '@/components/carte/carteHtml';
import type { ProuesseLocalisee } from '@/data';
import { PICTOS } from '@/data/pictos';
import type { Coords } from '@/hooks/usePositionJoueur';
import { colors, radius } from '@/theme';

type Props = {
  joueur: Coords;
  prouesses: ProuesseLocalisee[];
  onPress: () => void;
};

const neRienFaire = () => {};

// « Fenêtre astrale » du Journal : carte figée des prouesses les plus proches autour du joueur.
// Un appui ouvre l'onglet Cartes ; la carte elle-même ne capte aucun geste (le Journal défile).
export function MiniCarte({ joueur, prouesses, onPress }: Props) {
  const donnees = useMemo<DonneesCarte>(
    () => ({
      joueur,
      points: prouesses.map((p) => ({
        id: p.id,
        titre: p.titre,
        latitude: p.latitude,
        longitude: p.longitude,
        obtenue: p.obtenue,
        couleur: p.type ? PICTOS[p.type].couleur : undefined,
      })),
      photos: [],
    }),
    [joueur, prouesses],
  );

  return (
    <View style={styles.fenetre}>
      <View style={styles.carte}>
        <CarteLeaflet donnees={donnees} margeBas={0} apercu onMessage={neRienFaire} />
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir la carte des prouesses proches"
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fenetre: {
    height: 236,
    padding: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.xl,
  },
  carte: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.surfaceIllustration,
    borderRadius: radius.md,
  },
});
