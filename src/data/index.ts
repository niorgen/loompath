import prouessesJson from './prouesses.json';

export type TypeProuesse =
  | 'Attraction'
  | 'Spectacles'
  | 'Personnages'
  | 'Secret'
  | 'Point photo'
  | 'Mickeys cachés'
  | 'Chasse au trésor';

// Une ligne de src/data/prouesses.csv (statut Validé), générée par `npm run data`
export type ProuesseSource = {
  id: string;
  titre: string;
  sousTitre: string;
  description?: string;
  parc: string;
  land?: string;
  type?: TypeProuesse;
  code?: string;
  latitude?: number;
  longitude?: number;
};

export const prouessesSource = prouessesJson as ProuesseSource[];

// Libellés au singulier (méta d'une prouesse) et au pluriel (catégorie du carnet)
export const TYPE_LABELS: Record<TypeProuesse, { singulier: string; pluriel: string }> = {
  Attraction: { singulier: 'Attraction', pluriel: 'Attractions' },
  Spectacles: { singulier: 'Spectacle', pluriel: 'Spectacles' },
  Personnages: { singulier: 'Personnage', pluriel: 'Personnages' },
  Secret: { singulier: 'Secret', pluriel: 'Secrets' },
  'Point photo': { singulier: 'Point photo', pluriel: 'Points photo' },
  'Mickeys cachés': { singulier: 'Mickey caché', pluriel: 'Mickeys cachés' },
  'Chasse au trésor': { singulier: 'Chasse au trésor', pluriel: 'Chasses au trésor' },
};

export type Prouesse = ProuesseSource & {
  obtenue: boolean;
  /** Date ISO de la validation par le joueur */
  dateValidation?: string;
  photoUri?: string;
  /** Vignette JPEG en data URI, utilisée par la carte */
  miniature?: string;
};

export type ProuesseLocalisee = Prouesse & { latitude: number; longitude: number };

export const estLocalisee = <P extends ProuesseSource>(p: P): p is P & { latitude: number; longitude: number } =>
  p.latitude !== undefined && p.longitude !== undefined;

// Validations du joueur, indexées par identifiant de prouesse
// latitude/longitude : position du joueur à la prise de photo, enregistrée seulement
// pour les prouesses sans coordonnées dans le CSV (personnages, spectacles…)
export type Validation = {
  photoUri: string;
  miniature?: string;
  date: string;
  latitude?: number;
  longitude?: number;
};
export type Validations = Record<string, Validation>;

export function construireProuesses(validations: Validations): Prouesse[] {
  return prouessesSource.map((source) => {
    const validation = validations[source.id];
    return {
      ...source,
      // Les coordonnées du CSV priment sur la position du joueur
      ...(!estLocalisee(source) && validation?.latitude !== undefined && validation.longitude !== undefined
        ? { latitude: validation.latitude, longitude: validation.longitude }
        : {}),
      obtenue: !!validation,
      dateValidation: validation?.date,
      photoUri: validation?.photoUri,
      miniature: validation?.miniature,
    };
  });
}

// Une prouesse appartient à trois catégories à la fois : son parc, son land et son type
// (land et type peuvent manquer, ex. les prouesses d'hôtel sans type)
export type NiveauCategorie = 'parc' | 'land' | 'type';
const ORDRE_NIVEAUX: NiveauCategorie[] = ['parc', 'land', 'type'];

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function categoriesDe(p: ProuesseSource) {
  return [
    { niveau: 'parc' as const, nom: p.parc },
    ...(p.land ? [{ niveau: 'land' as const, nom: p.land }] : []),
    ...(p.type ? [{ niveau: 'type' as const, nom: TYPE_LABELS[p.type].pluriel }] : []),
  ].map((c) => ({ ...c, id: `${c.niveau}-${slug(c.nom)}` }));
}

export type Categorie = {
  id: string;
  niveau: NiveauCategorie;
  nom: string;
  prouesses: Prouesse[];
  obtenues: number;
  total: number;
};

export function construireCarnet(prouesses: Prouesse[]): Categorie[] {
  const parId = new Map<string, Categorie>();
  for (const prouesse of prouesses) {
    for (const { id, niveau, nom } of categoriesDe(prouesse)) {
      let categorie = parId.get(id);
      if (!categorie) {
        categorie = { id, niveau, nom, prouesses: [], obtenues: 0, total: 0 };
        parId.set(id, categorie);
      }
      categorie.prouesses.push(prouesse);
      categorie.total += 1;
      if (prouesse.obtenue) categorie.obtenues += 1;
    }
  }
  const categories = [...parId.values()];
  categories.forEach((c) => c.prouesses.sort((a, b) => a.titre.localeCompare(b.titre, 'fr')));
  // Parcs, puis lands, puis types ; ordre alphabétique dans chaque niveau
  return categories.sort(
    (a, b) =>
      ORDRE_NIVEAUX.indexOf(a.niveau) - ORDRE_NIVEAUX.indexOf(b.niveau) || a.nom.localeCompare(b.nom, 'fr'),
  );
}

// Recherche insensible à la casse et aux accents : une catégorie ressort si son nom,
// ou le titre ou le code d'une de ses prouesses, correspond.
const normaliser = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function rechercherCarnet(carnet: Categorie[], requete: string) {
  const q = normaliser(requete);
  if (!q) return carnet;
  return carnet.filter(
    (c) =>
      normaliser(c.nom).includes(q) ||
      c.prouesses.some((p) => [p.titre, p.code ?? ''].some((champ) => normaliser(champ).includes(q))),
  );
}

// Données locales provisoires du joueur (en attendant un backend)
export const journal = {
  voyageur: 'Eldwine',
};

// Stats du journal, sur tout le carnet ou sur un seul parc :
// score = nombre de prouesses validées, progression = part validée (0 à 1)
export function calculerStats(prouesses: Prouesse[], parc?: string) {
  const perimetre = parc ? prouesses.filter((p) => p.parc === parc) : prouesses;
  const score = perimetre.filter((p) => p.obtenue).length;
  return { score, progression: perimetre.length ? score / perimetre.length : 0 };
}
