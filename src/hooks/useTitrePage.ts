import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';

// Titre de l'onglet du navigateur propre à chaque écran (RGAA 8.6), remis à jour au retour sur l'écran
export function useTitrePage(titre?: string) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web' || typeof document === 'undefined') return;
      document.title = titre ? `${titre} – Loompath` : 'Loompath';
    }, [titre]),
  );
}
