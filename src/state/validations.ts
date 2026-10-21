import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { useMemo, useSyncExternalStore } from 'react';

import { construireCarnet, construireProuesses, estLocalisee, prouessesSource, type Validations } from '@/data';
import { enregistrerPhoto, supprimerPhoto } from '@/state/photos';

// Prouesses validées par le joueur, conservées sur l'appareil
const CLE_STOCKAGE = 'loompath:validations';

let validations: Validations = {};
const abonnes = new Set<() => void>();

function publier(suivantes: Validations) {
  validations = suivantes;
  abonnes.forEach((notifier) => notifier());
}

// Prouesses dont l'identifiant a changé dans le CSV : ancien ID -> nouvel ID
const IDS_RENOMMES: Record<string, string> = {
  '26': '24', // Rencontrer Woody
  '28': '105', // Rencontrer Jessie
};

// Reporte les validations des anciens IDs sur les nouveaux (sans écraser une validation existante)
function migrer(stockees: Validations) {
  const migrees = { ...stockees };
  let modifiees = false;
  for (const [ancien, nouveau] of Object.entries(IDS_RENOMMES)) {
    if (!migrees[ancien]) continue;
    migrees[nouveau] ??= migrees[ancien];
    delete migrees[ancien];
    modifiees = true;
  }
  return { migrees, modifiees };
}

AsyncStorage.getItem(CLE_STOCKAGE)
  .then(async (brut) => {
    if (!brut) return;
    const { migrees, modifiees } = migrer(JSON.parse(brut));
    publier({ ...migrees, ...validations });
    if (modifiees) await AsyncStorage.setItem(CLE_STOCKAGE, JSON.stringify(validations));
  })
  .catch(() => {
    // Stockage illisible : on repart d'un carnet vierge
  });

// Vignette légère (144 px) conservée avec la validation : la carte (WebView) ne peut pas
// lire les fichiers locaux, et elle survit au nettoyage du cache photo.
async function creerMiniature(photoUri: string) {
  try {
    const contexte = ImageManipulator.manipulate(photoUri);
    contexte.resize({ width: 144 });
    const image = await contexte.renderAsync();
    const { base64 } = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
    return base64 ? `data:image/jpeg;base64,${base64}` : undefined;
  } catch {
    return undefined;
  }
}

// Position du joueur, pour placer sur la carte la photo d'une prouesse sans coordonnées.
// Facultative : si la localisation est refusée ou indisponible, la validation se fait sans.
async function positionJoueur() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return {};
    const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: coords.latitude, longitude: coords.longitude };
  } catch {
    return {};
  }
}

// Valide une prouesse, ou remplace sa photo si elle l'est déjà : dans ce cas la date
// de validation et la position déjà enregistrée sont conservées
export async function validerProuesse(prouesseId: string, photoTemporaire: string) {
  const source = prouessesSource.find((p) => p.id === prouesseId);
  const existante = validations[prouesseId];
  const positionConnue =
    existante?.latitude !== undefined && existante.longitude !== undefined
      ? { latitude: existante.latitude, longitude: existante.longitude }
      : undefined;
  const [photoUri, miniature, position] = await Promise.all([
    enregistrerPhoto(prouesseId, photoTemporaire),
    creerMiniature(photoTemporaire),
    positionConnue ?? (source && !estLocalisee(source) ? positionJoueur() : {}),
  ]);
  publier({
    ...validations,
    [prouesseId]: { photoUri, miniature, date: existante?.date ?? new Date().toISOString(), ...position },
  });
  await AsyncStorage.setItem(CLE_STOCKAGE, JSON.stringify(validations));
  if (existante && existante.photoUri !== photoUri) await supprimerPhoto(existante.photoUri);
}

// Supprime la photo d'une prouesse : sans photo, la validation n'a plus de preuve et est annulée
export async function supprimerValidation(prouesseId: string) {
  const existante = validations[prouesseId];
  if (!existante) return;
  const restantes = { ...validations };
  delete restantes[prouesseId];
  publier(restantes);
  await AsyncStorage.setItem(CLE_STOCKAGE, JSON.stringify(validations));
  await supprimerPhoto(existante.photoUri);
}

function sAbonner(notifier: () => void) {
  abonnes.add(notifier);
  return () => abonnes.delete(notifier);
}

export function useValidations() {
  return useSyncExternalStore(sAbonner, () => validations);
}

// Toutes les prouesses, avec l'état de validation du joueur
export function useProuesses() {
  const courantes = useValidations();
  return useMemo(() => construireProuesses(courantes), [courantes]);
}

// Catégories du carnet (parcs, lands, types) et leur progression
export function useCarnet() {
  const prouesses = useProuesses();
  return useMemo(() => construireCarnet(prouesses), [prouesses]);
}
