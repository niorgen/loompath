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
  themes?: string[];
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

// « Parcs » du CSV qui ne sont pas des parcs à thème : regroupés sous « Resort » dans le carnet
const RESORT = ['Hôtels', 'Disney Village'];
export const estResort = (parc: string) => RESORT.includes(parc);

// Une prouesse appartient à trois catégories à la fois : son parc, son land et son type
// (land et type peuvent manquer, ex. les prouesses d'hôtel sans type), plus certains thèmes
export type NiveauCategorie = 'parc' | 'land' | 'type';
const ORDRE_NIVEAUX: NiveauCategorie[] = ['parc', 'land', 'type'];

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Thèmes du CSV qui forment aussi une catégorie, en plus du type (ex. les plantes, de type Secret)
const THEMES_CATEGORIES = ['Plantes'];

function categoriesDe(p: ProuesseSource) {
  return [
    { niveau: 'parc' as const, nom: p.parc },
    ...(p.land ? [{ niveau: 'land' as const, nom: p.land }] : []),
    ...(p.type ? [{ niveau: 'type' as const, nom: TYPE_LABELS[p.type].pluriel }] : []),
    ...(p.themes ?? []).filter((t) => THEMES_CATEGORIES.includes(t)).map((t) => ({ niveau: 'type' as const, nom: t })),
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

export const POINTS_PAR_PROUESSE = 10;

// Recherche dans les prouesses d'une catégorie : titre, indice ou code, sans accents ni casse
export function rechercherProuesses(prouesses: Prouesse[], requete: string) {
  const q = normaliser(requete);
  if (!q) return prouesses;
  return prouesses.filter((p) => [p.titre, p.sousTitre, p.code ?? ''].some((champ) => normaliser(champ).includes(q)));
}

// Stats du journal, sur tout le carnet ou sur un seul parc :
// score = points des prouesses validées, progression = part validée (0 à 1)
export function calculerStats(prouesses: Prouesse[], parc?: string) {
  const perimetre = parc ? prouesses.filter((p) => p.parc === parc) : prouesses;
  const validees = perimetre.filter((p) => p.obtenue).length;
  return {
    score: validees * POINTS_PAR_PROUESSE,
    progression: perimetre.length ? validees / perimetre.length : 0,
  };
}

// Chroniques : prouesses validées regroupées en étapes de la frise, de la plus récente à la plus ancienne.
// Mois en cours : une étape par jour (« Aujourd'hui », « Hier », « Lundi 12 octobre »).
// Mois précédents : une étape résumée par mois (« Septembre 2026 »).
export type EtapeChroniques = {
  id: string;
  titre: string;
  /** Ex. « mar. 20 oct. · 3 souvenirs » */
  meta: string;
  /** Étape d'un mois passé, affichée en aperçu */
  resume: boolean;
  prouesses: Prouesse[];
};

const debutDuJour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const cleJour = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export const formatDateValidation = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatHeureValidation = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export const compterSouvenirs = (n: number) => `${n} souvenir${n > 1 ? 's' : ''}`;

// Une visite au parc = un jour où au moins une prouesse a été validée
export const compterVisites = (prouesses: Prouesse[]) =>
  new Set(prouesses.filter((p) => p.dateValidation).map((p) => cleJour(new Date(p.dateValidation!)))).size;

export function construireChroniques(prouesses: Prouesse[], maintenant = new Date()): EtapeChroniques[] {
  const aujourdhui = debutDuJour(maintenant);
  const hier = new Date(aujourdhui);
  hier.setDate(aujourdhui.getDate() - 1);
  const debutDuMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);

  const etapes = new Map<string, EtapeChroniques>();
  const validees = prouesses
    .filter((p) => p.dateValidation)
    .sort((a, b) => b.dateValidation!.localeCompare(a.dateValidation!));

  for (const prouesse of validees) {
    const date = new Date(prouesse.dateValidation!);
    const jour = debutDuJour(date);
    const resume = jour < debutDuMois;
    const id = resume ? `${date.getFullYear()}-${date.getMonth()}` : cleJour(date);
    let etape = etapes.get(id);
    if (!etape) {
      const titre = resume
        ? majuscule(date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))
        : jour >= aujourdhui
          ? 'Aujourd’hui'
          : jour >= hier
            ? 'Hier'
            : majuscule(date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
      etape = { id, titre, meta: '', resume, prouesses: [] };
      etapes.set(id, etape);
    }
    etape.prouesses.push(prouesse);
  }

  return [...etapes.values()].map((etape) => {
    const nombre = compterSouvenirs(etape.prouesses.length);
    // Aujourd'hui et Hier rappellent la date, les autres titres la contiennent déjà
    const rappel = !etape.resume && !/\d/.test(etape.titre);
    const date = new Date(etape.prouesses[0].dateValidation!).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return { ...etape, meta: rappel ? `${date} · ${nombre}` : nombre };
  });
}

// Thèmes affichés sur une carte souvenir : lieu, type, puis thèmes du CSV (sans doublon,
// certains thèmes reprenant le land ou le type, ex. « Fantasyland », « Point photo »)
export function themesDe(p: ProuesseSource) {
  const themes = [p.land ?? p.parc, p.type && TYPE_LABELS[p.type].singulier, ...(p.themes ?? [])];
  return [...new Set(themes.filter((t): t is string => !!t))];
}
