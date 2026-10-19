import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useState } from 'react';

// Photos de validation sur le web : l'appareil photo renvoie une URL blob: qui meurt au
// rechargement de la page, et localStorage (~5 Mo) est trop petit pour des photos.
// On range donc une version réduite dans IndexedDB, référencée par « idb:<clé> ».

const PREFIXE = 'idb:';
const BASE = 'loompath';
const MAGASIN = 'photos';
const LARGEUR_MAX = 1200;

function ouvrirBase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const requete = indexedDB.open(BASE, 1);
    requete.onupgradeneeded = () => requete.result.createObjectStore(MAGASIN);
    requete.onsuccess = () => resolve(requete.result);
    requete.onerror = () => reject(requete.error);
  });
}

async function transaction<T>(mode: IDBTransactionMode, action: (magasin: IDBObjectStore) => IDBRequest<T>) {
  const base = await ouvrirBase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const requete = action(base.transaction(MAGASIN, mode).objectStore(MAGASIN));
      requete.onsuccess = () => resolve(requete.result);
      requete.onerror = () => reject(requete.error);
    });
  } finally {
    base.close();
  }
}

export async function enregistrerPhoto(prouesseId: string, uriTemporaire: string) {
  try {
    const contexte = ImageManipulator.manipulate(uriTemporaire);
    contexte.resize({ width: LARGEUR_MAX });
    const image = await contexte.renderAsync();
    const { uri } = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
    const blob = await (await fetch(uri)).blob();
    const cle = `${prouesseId}-${Date.now()}`;
    await transaction('readwrite', (magasin) => magasin.put(blob, cle));
    return PREFIXE + cle;
  } catch {
    // Stockage impossible : l'URL temporaire vaut pour la session, la miniature ensuite
    return uriTemporaire;
  }
}

// Supprime une photo remplacée (seules celles rangées dans IndexedDB sont concernées)
export async function supprimerPhoto(uri: string) {
  if (!uri.startsWith(PREFIXE)) return;
  try {
    await transaction('readwrite', (magasin) => magasin.delete(uri.slice(PREFIXE.length)));
  } catch {
    // Photo déjà absente : rien à faire
  }
}

// Convertit « idb:<clé> » en URL blob: affichable, libérée quand elle ne sert plus
export function usePhotoAffichable(uri: string | undefined) {
  const [chargee, setChargee] = useState<{ uri: string; url: string }>();
  const stockee = uri?.startsWith(PREFIXE) ? uri : undefined;

  useEffect(() => {
    if (!stockee) return;
    let annule = false;
    let url: string | undefined;
    transaction<Blob | undefined>('readonly', (magasin) => magasin.get(stockee.slice(PREFIXE.length)))
      .then((blob) => {
        if (annule || !blob) return;
        url = URL.createObjectURL(blob);
        setChargee({ uri: stockee, url });
      })
      .catch(() => {
        // Photo introuvable : la miniature prendra le relais
      });
    return () => {
      annule = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [stockee]);

  if (!stockee) return uri;
  return chargee?.uri === stockee ? chargee.url : undefined;
}
