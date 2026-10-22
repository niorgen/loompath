import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CarteLeaflet } from '@/components/carte/CarteLeaflet';
import type { DonneesCarte, MessageCarte } from '@/components/carte/carteHtml';
import type { ProuesseLocalisee } from '@/data';
import { PICTOS } from '@/data/pictos';
import type { Coords } from '@/hooks/usePositionJoueur';
import { colors, radius } from '@/theme';

type Props = {
  joueur: Coords;
  prouesses: ProuesseLocalisee[];
  /** Appui sur le picto d'une prouesse */
  onOuvrirProuesse: (id: string) => void;
};

// « Fenêtre astrale » du Journal : carte figée (sans déplacement ni zoom, le Journal défile)
// des prouesses les plus proches, chacune avec le picto de son type. Un appui sur un picto
// ouvre la page de la prouesse ; le fond de carte ne réagit pas.
export function MiniCarte({ joueur, prouesses, onOuvrirProuesse }: Props) {
  const donnees = useMemo<DonneesCarte>(
    () => ({
      joueur,
      points: prouesses.map((p) => ({
        id: p.id,
        titre: p.titre,
        latitude: p.latitude,
        longitude: p.longitude,
        obtenue: p.obtenue,
        couleur: p.type ? PICTOS[p.type].couleur : colors.accentSecondary,
        picto: p.type ? PICTOS[p.type].trace : undefined,
      })),
      photos: [],
    }),
    [joueur, prouesses],
  );

  const recevoir = useCallback(
    (message: MessageCarte) => {
      if (message.type === 'prouesse') onOuvrirProuesse(message.id);
    },
    [onOuvrirProuesse],
  );

  return (
    <View style={styles.fenetre}>
      <View style={styles.carte}>
        <CarteLeaflet donnees={donnees} margeBas={0} apercu onMessage={recevoir} />
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
