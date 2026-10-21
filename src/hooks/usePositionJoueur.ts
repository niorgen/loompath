import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { estLocalisee, prouessesSource } from '@/data';

export type Coords = { latitude: number; longitude: number };

export function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Position actuelle du joueur : position undefined tant qu'elle est inconnue ;
// refusee = true tant que la localisation n'est pas autorisée (refusée, ou reportée à « Plus tard »
// dans l'introduction). La demande système ne part que sur appui du joueur (autoriser).
export function usePositionJoueur() {
  const [position, setPosition] = useState<Coords>();
  const [refusee, setRefusee] = useState(false);
  const [peutRedemander, setPeutRedemander] = useState(true);
  // Relance la vérification ; demander = afficher la demande système plutôt que lire l'état
  const [tentative, setTentative] = useState({ n: 0, demander: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status, canAskAgain } = tentative.demander
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();
      if (cancelled) return;
      setRefusee(status !== 'granted');
      setPeutRedemander(canAskAgain);
      if (status !== 'granted') return;
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!cancelled) setPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    })().catch(() => {
      // Localisation indisponible : position inconnue
    });
    return () => {
      cancelled = true;
    };
  }, [tentative]);

  // Retour dans l'app (ex. depuis les réglages) : on relit l'autorisation si elle manquait
  useEffect(() => {
    if (!refusee) return;
    const abonnement = AppState.addEventListener('change', (etat) => {
      if (etat === 'active') setTentative((t) => ({ n: t.n + 1, demander: false }));
    });
    return () => abonnement.remove();
  }, [refusee]);

  // Redemande l'autorisation ; si le système ne peut plus la proposer, ouvre les réglages de l'app
  const autoriser = useCallback(() => {
    if (!peutRedemander && Platform.OS !== 'web') Linking.openSettings();
    else setTentative((t) => ({ n: t.n + 1, demander: true }));
  }, [peutRedemander]);

  return { position, refusee, autoriser };
}

// Au-delà de cette distance de toute prouesse, le joueur n'est dans aucun parc
const RAYON_PARC_KM = 2;

// Parc du joueur : celui de la prouesse géolocalisée (coordonnées du CSV) la plus proche
export function useParcDuJoueur(position: Coords | undefined) {
  return useMemo(() => {
    if (!position) return undefined;
    let plusProche: { parc: string; distance: number } | undefined;
    for (const prouesse of prouessesSource.filter(estLocalisee)) {
      const distance = distanceKm(position, prouesse);
      if (!plusProche || distance < plusProche.distance) plusProche = { parc: prouesse.parc, distance };
    }
    return plusProche && plusProche.distance <= RAYON_PARC_KM ? plusProche.parc : undefined;
  }, [position]);
}
