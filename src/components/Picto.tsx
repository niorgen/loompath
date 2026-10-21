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
  return <Trace trace={picto.trace} couleur={couleur ?? picto.couleur} taille={taille} />;
}

// Icônes au trait hors planche (maquettes de l'introduction), même grille 24 × 24
export const TRACES = {
  ampoule: "<path d='M9 18h6'/><path d='M10 22h4'/><path d='M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z'/>",
  etoile: "<path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z'/>",
  repere: "<path d='M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z'/><circle cx='12' cy='9.5' r='2.5'/>",
  coche: "<path d='M20 6 9 17l-5-5'/>",
  cadenas: "<rect x='4' y='11' width='16' height='10' rx='2'/><path d='M8 11V7a4 4 0 0 1 8 0v4'/>",
  retour: "<path d='m15 18-6-6 6-6'/>",
  suivant: "<path d='m9 18 6-6-6-6'/>",
} as const;

type TraceProps = {
  /** Tracé SVG (planche ou TRACES) */
  trace: string;
  couleur: string;
  taille?: number;
  epaisseur?: number;
};

export function Trace({ trace, couleur, taille = 16, epaisseur = 1.8 }: TraceProps) {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${couleur}" stroke-width="${epaisseur}" stroke-linecap="round" stroke-linejoin="round">${trace}</svg>`;
  return <SvgXml xml={xml} width={taille} height={taille} />;
}
