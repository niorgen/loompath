import { useEffect, useState } from 'react';

// Faux au premier rendu, vrai une fois cette première image affichée : un écran lourd à monter
// (grille de cartes et leurs pictos SVG) montre d'abord son squelette au lieu de bloquer la navigation
export function useAffichageDiffere() {
  const [pret, setPret] = useState(false);
  useEffect(() => {
    // Le squelette est peint à l'image suivante ; le contenu réel est monté juste après
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    const image = requestAnimationFrame(() => {
      minuterie = setTimeout(() => setPret(true), 0);
    });
    return () => {
      cancelAnimationFrame(image);
      if (minuterie) clearTimeout(minuterie);
    };
  }, []);
  return pret;
}
