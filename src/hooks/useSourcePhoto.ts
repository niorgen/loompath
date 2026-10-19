import { useState } from 'react';

import { usePhotoAffichable } from '@/state/photos';

// Image à afficher pour une validation : la photo d'origine, ou la miniature si elle a disparu
// (URL blob: sur le web après rechargement, cache vidé sur mobile). onError est à passer à <Image>.
export function useSourcePhoto(photoUri: string | undefined, miniature: string | undefined) {
  const photo = usePhotoAffichable(photoUri);
  const [uriIllisible, setUriIllisible] = useState<string>();
  const source = photo && photo !== uriIllisible ? photo : miniature;

  const onError = () => {
    if (source === photo) setUriIllisible(photo);
  };

  return { source, onError };
}
