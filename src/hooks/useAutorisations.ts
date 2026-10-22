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

// Sur le web, expo-location répond toujours canAskAgain = true, mais un navigateur ne redemande
// jamais une autorisation refusée : elle ne se rétablit que dans les réglages du site
const lire = ({ status, canAskAgain }: Permission) => ({
  etat: (status === 'granted' ? 'autorisee' : status === 'denied' ? 'refusee' : 'non-demandee') as EtatAutorisation,
  bloquee: status === 'denied' && (!canAskAgain || Platform.OS === 'web'),
});

function useAutorisation(
  lireSysteme: () => Promise<Permission>,
  demanderSysteme: () => Promise<Permission>,
  /** Nom de l'autorisation dans l'API Permissions du navigateur, pour suivre ses changements sur le web */
  nomWeb: PermissionName,
) {
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

  // Web : l'autorisation peut être retirée ou rendue dans les réglages du site sans quitter la page,
  // ce qui ne déclenche ni focus ni retour dans l'app ; le navigateur le signale par « change »
  useEffect(() => {
    if (Platform.OS !== 'web' || !navigator.permissions?.query) return;
    let etat: PermissionStatus | undefined;
    let actif = true;
    navigator.permissions
      .query({ name: nomWeb })
      .then((statut) => {
        if (!actif) return;
        etat = statut;
        statut.addEventListener('change', rafraichir);
      })
      .catch(() => {
        // Autorisation inconnue de ce navigateur : on s'en tient au focus et au retour dans l'app
      });
    return () => {
      actif = false;
      etat?.removeEventListener('change', rafraichir);
    };
  }, [nomWeb, rafraichir]);

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
    localisation: useAutorisation(
      Location.getForegroundPermissionsAsync,
      Location.requestForegroundPermissionsAsync,
      'geolocation',
    ),
    appareilPhoto: useAutorisation(
      ImagePicker.getCameraPermissionsAsync,
      ImagePicker.requestCameraPermissionsAsync,
      'camera' as PermissionName,
    ),
  };
}
