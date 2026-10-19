import { Directory, File, Paths } from 'expo-file-system';

// Photos de validation sur mobile : l'appareil photo écrit dans le cache, que le système
// peut vider. On copie donc chaque photo dans le dossier documents de l'app.
// (Version web : photos.web.ts)

export async function enregistrerPhoto(prouesseId: string, uriTemporaire: string) {
  try {
    const dossier = new Directory(Paths.document, 'photos');
    if (!dossier.exists) dossier.create({ idempotent: true, intermediates: true });
    const destination = new File(dossier, `${prouesseId}-${Date.now()}.jpg`);
    await new File(uriTemporaire).copy(destination, { overwrite: true });
    return destination.uri;
  } catch {
    // Copie impossible : on garde la photo du cache, la miniature servira de secours
    return uriTemporaire;
  }
}

// Supprime une photo remplacée, si elle est dans le dossier de l'app (jamais celles du cache ou d'ailleurs)
export async function supprimerPhoto(uri: string) {
  try {
    const dossier = new Directory(Paths.document, 'photos');
    if (!uri.startsWith(dossier.uri)) return;
    const fichier = new File(uri);
    if (fichier.exists) fichier.delete();
  } catch {
    // Fichier déjà absent ou illisible : rien à faire
  }
}

// URI directement affichable par <Image>
export function usePhotoAffichable(uri: string | undefined) {
  return uri;
}
