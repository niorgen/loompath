import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';

export type EtatAutorisation = 'autorisee' | 'refusee' | 'non-demandee';

type Permission = { status: string; canAskAgain: boolean };

export type Autorisation = {
  etat: EtatAutorisation;
  /** Le système ne proposera plus la demande : il faut passer par les réglages */
  bloquee: boolean;
  /** Affiche la demande système, ou ouvre les réglages de l'app si elle est bloquée */
  demander: () => Promise<void>;
};

const lire = ({ status, canAskAgain }: Permission) => ({
  etat: (status === 'granted' ? 'autorisee' : status === 'denied' ? 'refusee' : 'non-demandee') as EtatAutorisation,
  bloquee: status === 'denied' && !canAskAgain,
});

function useAutorisation(lireSysteme: () => Promise<Permission>, demanderSysteme: () => Promise<Permission>) {
  const [permission, setPermission] = useState<{ etat: EtatAutorisation; bloquee: boolean }>({
    etat: 'non-demandee',
    bloquee: false,
  });

  const rafraichir = useCallback(() => {
    lireSysteme()
      .then((p) => setPermission(lire(p)))
      .catch(() => {
        // Service indisponible (ex. navigateur sans API de permissions) : état inchangé
      });
  }, [lireSysteme]);

  // À l'arrivée sur l'écran et au retour dans l'app (ex. depuis les réglages)
  useFocusEffect(rafraichir);
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (etat) => {
      if (etat === 'active') rafraichir();
    });
    return () => abonnement.remove();
  }, [rafraichir]);

  const demander = useCallback(async () => {
    if (permission.bloquee) {
      if (Platform.OS !== 'web') await Linking.openSettings();
      return;
    }
    try {
      setPermission(lire(await demanderSysteme()));
    } catch {
      // Demande impossible : rien à faire
    }
  }, [permission.bloquee, demanderSysteme]);

  return { ...permission, demander };
}

// Autorisations demandées par l'introduction, à reprendre depuis le Profil
export function useAutorisations(): { localisation: Autorisation; appareilPhoto: Autorisation } {
  return {
    localisation: useAutorisation(Location.getForegroundPermissionsAsync, Location.requestForegroundPermissionsAsync),
    appareilPhoto: useAutorisation(ImagePicker.getCameraPermissionsAsync, ImagePicker.requestCameraPermissionsAsync),
  };
}
