import { useEffect, useId, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type EasingFunction,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { FondNuit } from '@/components/Fonds';
import { Etincelle } from '@/components/Picto';
import { fonts, illustration } from '@/theme';

// Splash animé « Nuit » (canvas « Design ») : logo qui se dessine, titre et étincelles.
// Il prend le relais du splash natif puis s'efface quand l'app est prête.

const LAVANDE = '#C9B6FF';
const ORANGE = '#FFC98A';
const MENTHE = '#9EE6D4';
const FOND_LOGO = '#0D1330';

// Durée minimale d'affichage : le temps que l'animation d'entrée se termine
const DUREE_MIN = 1800;
const DUREE_SORTIE = 350;

// Étincelles du ciel : position en fraction de l'écran (maquette 390 × 844), taille, couleur, déphasage
const CIEL = [
  { x: 58 / 390, y: 190 / 844, taille: 14, couleur: LAVANDE, delai: 0 },
  { x: 312 / 390, y: 236 / 844, taille: 10, couleur: MENTHE, delai: 600 },
  { x: 86 / 390, y: 560 / 844, taille: 10, couleur: '#F5A3C7', delai: 1100 },
  { x: 300 / 390, y: 600 / 844, taille: 16, couleur: ORANGE, delai: 300 },
  { x: 196 / 390, y: 140 / 844, taille: 8, couleur: illustration.papier, delai: 1500 },
  { x: 40 / 390, y: 420 / 844, taille: 8, couleur: illustration.papier, delai: 900 },
  { x: 340 / 390, y: 430 / 844, taille: 8, couleur: illustration.papier, delai: 1800 },
];

const COURBES = {
  logo: Easing.bezier(0.2, 1.3, 0.4, 1),
  pop: Easing.bezier(0.2, 1.4, 0.4, 1),
  rebond: Easing.bezier(0.2, 1.6, 0.4, 1),
  sortie: Easing.out(Easing.ease),
  boucle: Easing.inOut(Easing.ease),
};

// Valeur de 0 à 1 animée une fois (ou en boucle aller-retour), après un délai en ms.
// « Réduire les animations » : état final direct, sans boucle.
function useAnimation(delai: number, duree: number, courbe: EasingFunction, boucle = false) {
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
        const aller = Animated.timing(valeur, { toValue: 1, duration: duree, easing: courbe, useNativeDriver: true });
        animation = boucle
          ? Animated.sequence([
              Animated.delay(delai),
              Animated.loop(
                Animated.sequence([
                  aller,
                  Animated.timing(valeur, { toValue: 0, duration: duree, easing: courbe, useNativeDriver: true }),
                ]),
              ),
            ])
          : Animated.sequence([Animated.delay(delai), aller]);
        animation.start();
      });
    return () => animation?.stop();
  }, [valeur, delai, duree, courbe, boucle]);
  return valeur;
}

// Calque du logo (repère 100 × 100) qui apparaît en grossissant depuis `origine`
function CalqueLogo({
  delai,
  duree,
  courbe,
  origine,
  children,
}: {
  delai: number;
  duree: number;
  courbe: EasingFunction;
  origine: string;
  children: ReactNode;
}) {
  const v = useAnimation(delai, duree, courbe);
  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          transformOrigin: origine,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
        },
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        {children}
      </Svg>
    </Animated.View>
  );
}

// Étoile à quatre branches centrée en (cx, cy), de demi-envergure r
const etoile = (cx: number, cy: number, r: number) => {
  const c = r * 0.28;
  return `M${cx} ${cy - r}L${cx + c} ${cy - c}L${cx + r} ${cy}L${cx + c} ${cy + c}L${cx} ${cy + r}L${cx - c} ${cy + c}L${cx - r} ${cy}L${cx - c} ${cy - c}Z`;
};

function Logo() {
  const v = useAnimation(0, 600, COURBES.logo);
  return (
    <Animated.View
      style={[
        styles.logo,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
        },
      ]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Loompath"
    >
      <View style={styles.logoFond}>
        <CalqueLogo delai={300} duree={600} courbe={COURBES.pop} origine="50% 56%">
          <Circle cx={50} cy={42} r={17} fill={LAVANDE} />
          <Path d="M42 52L37 80H63L58 52Z" fill={LAVANDE} />
        </CalqueLogo>
        <CalqueLogo delai={850} duree={500} courbe={COURBES.rebond} origine="50% 42%">
          <Path d={etoile(50, 42, 8)} fill={FOND_LOGO} />
        </CalqueLogo>
        <CalqueLogo delai={1100} duree={450} courbe={COURBES.rebond} origine="80% 20%">
          <Path d={etoile(80, 20, 5)} fill={ORANGE} />
        </CalqueLogo>
        <CalqueLogo delai={1250} duree={450} courbe={COURBES.rebond} origine="20% 28%">
          <Path d={etoile(20, 28, 3.5)} fill={MENTHE} />
        </CalqueLogo>
      </View>
    </Animated.View>
  );
}

// Fondu en montant de 14 px
function Monte({ delai, style, children }: { delai: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const v = useAnimation(delai, 600, COURBES.sortie);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function EtincelleCiel({ x, y, taille, couleur, delai }: (typeof CIEL)[number]) {
  const v = useAnimation(delai, 1200, COURBES.boucle, true);
  return (
    <Animated.View
      style={[
        styles.ciel,
        {
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
        },
      ]}
    >
      <Etincelle couleur={couleur} taille={taille} />
    </Animated.View>
  );
}

function Halo() {
  const id = `halo-${useId().replace(/[^\w-]/g, '')}`;
  const v = useAnimation(0, 1200, COURBES.sortie);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.halo,
        { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 280 280">
        <Defs>
          <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={LAVANDE} stopOpacity={0.28} />
            <Stop offset="0.65" stopColor={LAVANDE} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={140} cy={140} r={140} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

type Props = {
  /** L'app est prête : le splash s'efface dès que l'animation d'entrée est jouée */
  pret: boolean;
  onTermine: () => void;
};

export function SplashAnime({ pret, onTermine }: Props) {
  const [sortie] = useState(() => new Animated.Value(1));
  const [entreeJouee, setEntreeJouee] = useState(false);

  useEffect(() => {
    const minuteur = setTimeout(() => setEntreeJouee(true), DUREE_MIN);
    return () => clearTimeout(minuteur);
  }, []);

  useEffect(() => {
    if (!pret || !entreeJouee) return;
    const animation = Animated.timing(sortie, {
      toValue: 0,
      duration: DUREE_SORTIE,
      easing: COURBES.sortie,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => finished && onTermine());
    return () => animation.stop();
  }, [pret, entreeJouee, sortie, onTermine]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: sortie }]}>
      <FondNuit variante="splash" />
      {CIEL.map((e, i) => (
        <EtincelleCiel key={i} {...e} />
      ))}
      <View style={styles.centre}>
        <Halo />
        <View style={styles.bloc}>
          <Logo />
          <Monte delai={900} style={styles.titres}>
            <Text style={styles.titre}>Loompath</Text>
            <Text style={styles.devise}>TISSER VOTRE AVENTURE</Text>
          </Monte>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centre: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloc: {
    alignItems: 'center',
    gap: 22,
    marginTop: -60,
  },
  halo: {
    position: 'absolute',
    width: 280,
    height: 280,
    marginTop: -140,
  },
  logo: {
    width: 128,
    height: 128,
    borderRadius: 29,
    boxShadow: '0px 0px 0px 1px #2F3A73, 0px 24px 60px rgba(0,0,0,0.5)',
  },
  logoFond: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 29,
    backgroundColor: FOND_LOGO,
  },
  titres: {
    alignItems: 'center',
    gap: 8,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: 0.4,
    color: '#F7F5FF',
  },
  devise: {
    fontFamily: fonts.interBold,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 2.2,
    color: illustration.texteDoux,
  },
  ciel: {
    position: 'absolute',
  },
});
