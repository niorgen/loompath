import { useMemo } from 'react';

import { estLocalisee, type ProuesseLocalisee } from '@/data';
import { distanceKm, type Coords } from '@/hooks/usePositionJoueur';
import { useProuesses } from '@/state/validations';

// Entrée de Disneyland Paris : position utilisée si la localisation est refusée
const FALLBACK: Coords = { latitude: 48.8722, longitude: 2.7758 };

export function formatDistance(km: number) {
  if (km < 1) return { valeur: String(Math.round(km * 1000)), unite: 'm' };
  const valeur = km < 100 ? km.toFixed(1).replace('.', ',') : Math.round(km).toLocaleString('fr-FR');
  return { valeur, unite: 'km' };
}

// Prouesses géolocalisées les plus proches du joueur, encore à valider
// (celles sans coordonnées ou déjà obtenues sont ignorées)
export function useProuessesProches(position: Coords | undefined, limit = 5) {
  const prouesses = useProuesses();

  return useMemo(() => {
    const origine = position ?? FALLBACK;
    return prouesses
      .filter((prouesse) => !prouesse.obtenue)
      .filter(estLocalisee)
      .map((prouesse): ProuesseLocalisee & { distanceKm: number } => ({
        ...prouesse,
        distanceKm: distanceKm(origine, prouesse),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }, [prouesses, position, limit]);
}
