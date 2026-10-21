import { SvgXml } from 'react-native-svg';

import { TYPE_LABELS, type TypeProuesse } from '@/data';
import { PICTOS, type Picto as DefinitionPicto } from '@/data/pictos';

// Les noms du CSV ne reprennent pas toujours ceux de la planche (« Disney Hotel New York – The Art
// of Marvel », « Festival Halloween Disney »…) : on compare des noms sans accents ni « Disney »
const normaliser = (nom: string) =>
  nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+[–-]\s+.*$/, '')
    .replace(/\s*\(theme\)$/, '')
    .replace(/^disney\s+|\s+disney$/g, '')
    .trim();

// Thèmes avant lands dans la planche : « Fantasyland » désigne donc le land
const parNom = new Map(Object.entries(PICTOS).map(([nom, picto]) => [normaliser(nom), picto]));

// Les types apparaissent aussi au singulier ou au pluriel (« Mickey caché », « Attractions »)
for (const [type, { singulier, pluriel }] of Object.entries(TYPE_LABELS)) {
  const picto = PICTOS[type as TypeProuesse];
  if (picto) [singulier, pluriel].forEach((libelle) => parNom.set(normaliser(libelle), picto));
}

export const pictoDe = (nom: string): DefinitionPicto | undefined => parNom.get(normaliser(nom));

type Props = {
  /** Nom d'un type, thème, parc, land ou hôtel */
  nom: string;
  taille?: number;
  /** Remplace la couleur de la planche (ex. picto posé sur un fond clair) */
  couleur?: string;
};

// Pictogramme d'un tag ; rien si la planche n'en prévoit pas pour ce nom
export function Picto({ nom, taille = 16, couleur }: Props) {
  const picto = pictoDe(nom);
  if (!picto) return null;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${couleur ?? picto.couleur}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${picto.trace}</svg>`;
  return <SvgXml xml={xml} width={taille} height={taille} />;
}
