import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue } from 'react-native';

import { colors, radius } from '@/theme';

// Pulsation commune aux blocs d'un squelette, tant qu'il est affiché
function usePulsation() {
  const [opacite] = useState(() => new Animated.Value(0.45));
  useEffect(() => {
    const courbe = Easing.inOut(Easing.ease);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacite, { toValue: 1, duration: 700, easing: courbe, useNativeDriver: true }),
        Animated.timing(opacite, { toValue: 0.45, duration: 700, easing: courbe, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacite]);
  return opacite;
}

type BlocProps = {
  largeur: DimensionValue;
  hauteur: number;
  arrondi?: number;
};

function Bloc({ largeur, hauteur, arrondi = radius.sm }: BlocProps) {
  return <View style={[styles.bloc, { width: largeur, height: hauteur, borderRadius: arrondi }]} />;
}

// Silhouette d'une carte de la grille (CarteLand) : nom et picto, jauge, « Consulter »
function CarteSquelette() {
  return (
    <View style={styles.carte}>
      <View style={styles.entete}>
        <Bloc largeur="60%" hauteur={10} />
        <Bloc largeur={16} hauteur={16} arrondi={radius.pill} />
      </View>
      <View style={styles.progression}>
        <Bloc largeur="100%" hauteur={6} arrondi={radius.pill} />
        <Bloc largeur="45%" hauteur={10} />
      </View>
      <Bloc largeur="35%" hauteur={10} />
    </View>
  );
}

// Silhouette d'une ligne de liste (ListRow) : repère, titre et sous-titre, élément de fin
function LigneSquelette() {
  return (
    <View style={styles.ligneListe}>
      <Bloc largeur={46} hauteur={46} />
      <View style={styles.texteLigne}>
        <Bloc largeur="70%" hauteur={14} />
        <Bloc largeur="45%" hauteur={10} />
      </View>
      <Bloc largeur={16} hauteur={16} arrondi={radius.pill} />
    </View>
  );
}

function GrilleSquelette({ cartes }: { cartes: number }) {
  return (
    <View style={styles.grille}>
      {Array.from({ length: Math.ceil(cartes / 2) }, (_, ligne) => (
        <View key={ligne} style={styles.ligne}>
          <CarteSquelette />
          {ligne * 2 + 1 < cartes ? <CarteSquelette /> : <View style={styles.vide} />}
        </View>
      ))}
    </View>
  );
}

function ListeSquelette({ lignes }: { lignes: number }) {
  return (
    <View style={styles.liste}>
      {Array.from({ length: lignes }, (_, i) => (
        <LigneSquelette key={i} />
      ))}
    </View>
  );
}

export type SectionSquelette = {
  /** Cartes deux par deux (CarteLand) ou lignes de liste (ListRow) */
  forme: 'grille' | 'liste';
  nombre: number;
  /** Faux pour une liste sans titre de section */
  titre?: boolean;
};

// Squelette des sections d'un écran du carnet (titre puis cartes ou lignes),
// affiché pendant le montage du vrai contenu
export function Squelette({ sections }: { sections: SectionSquelette[] }) {
  const opacite = usePulsation();
  return (
    <Animated.View
      style={[styles.sections, { opacity: opacite }]}
      accessible
      accessibilityLabel="Chargement des prouesses"
      aria-busy
    >
      {sections.map(({ forme, nombre, titre = true }, i) => (
        <View key={i} style={styles.section}>
          {titre ? <Bloc largeur={140} hauteur={23} /> : null}
          {forme === 'grille' ? <GrilleSquelette cartes={nombre} /> : <ListeSquelette lignes={nombre} />}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bloc: {
    backgroundColor: colors.surfacePlaceholder,
  },
  sections: {
    gap: 24,
  },
  section: {
    gap: 16,
  },
  grille: {
    gap: 16,
  },
  ligne: {
    flexDirection: 'row',
    gap: 16,
  },
  vide: {
    flex: 1,
  },
  // Mêmes marges et espacements que CarteLand
  carte: {
    flex: 1,
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 0.7,
    borderColor: colors.borderCard,
    borderRadius: radius.md,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progression: {
    gap: 6,
  },
  // Mêmes marges et espacements que ListRow
  liste: {
    gap: 8,
  },
  ligneListe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: colors.surfaceRow,
    borderRadius: radius.md,
  },
  texteLigne: {
    flex: 1,
    gap: 6,
  },
});
