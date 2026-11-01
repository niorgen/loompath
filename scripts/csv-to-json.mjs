// Convertit les CSV de src/data (prouesses, personnages, saison) en src/data/prouesses.json
// Usage : npm run data (lancé automatiquement par npm start, web, android et ios)
import { readFileSync, writeFileSync } from "node:fs";

// theme : thème ajouté à toutes les lignes du fichier (les prouesses de saison forment l'univers « Saisons »)
const SOURCES = [
  { nom: "prouesses.csv" },
  { nom: "loompath-prouesses - Personnages.csv" },
  { nom: "loompath-prouesses - Saison.csv", theme: "Saisons" },
];
const OUT = new URL("../src/data/prouesses.json", import.meta.url);

// Seules les prouesses prêtes sont publiées dans l'app
const STATUTS_RETENUS = new Set(["Terminé", "Validé"]);

// Parsing CSV (gère les guillemets et "" échappés)
function parseCSV(text) {
  const out = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); out.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); out.push(row); }
  const [header, ...data] = out.filter(r => r.length > 1);
  // La première colonne est le statut, quel que soit son intitulé (« Statut », « village », « Terminé »…)
  const colonnes = ["Statut", ...header.slice(1).map(h => h.trim())];
  return data.map(r => Object.fromEntries(colonnes.map((h, i) => [h, (r[i] ?? "").trim()])));
}

// "48.866153, 2.77663" -> { latitude, longitude } (absent si vide ou invalide)
function coordonnees(brut) {
  const [latitude, longitude] = brut.split(",").map(v => parseFloat(v));
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : {};
}

// Colonnes « Thème 4/5/6 » et thème du fichier -> { themes: [...] } (absent si aucun n'est renseigné)
function themes(l) {
  const liste = [...new Set(["Thème 4", "Thème 5", "Thème 6"].map(c => l[c]).concat(l.theme).filter(Boolean))];
  return liste.length ? { themes: liste } : {};
}

const lignes = SOURCES.flatMap(({ nom, theme }) =>
  parseCSV(readFileSync(new URL(`../src/data/${nom}`, import.meta.url), "utf8")).map(l => ({ ...l, theme })),
);
const prouesses = lignes
  .filter(l => STATUTS_RETENUS.has(l["Statut"]))
  .map(l => ({
    id: l["ID"],
    titre: l["Prouesse"],
    sousTitre: l["Sous-titre"],
    description: l["Description"] || undefined,
    parc: l["Catégorie : Parc"],
    land: l["Catégorie : Land"] || undefined,
    type: l["Type"] || undefined,
    code: l["Code (source)"] || undefined,
    ...themes(l),
    ...coordonnees(l["Coordonnées GPS"]),
  }));

const ids = prouesses.map(p => p.id);
const doublons = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
if (doublons.length) throw new Error(`ID(s) en double entre les CSV : ${doublons.join(", ")}`);

const TYPES_CONNUS = ["Attraction", "Spectacles", "Personnages", "Secret", "Point photo", "Mickeys cachés", "Chasse au trésor", "Activités"];
const types = new Set(prouesses.map(p => p.type).filter(Boolean));
const inconnus = [...types].filter(t => !TYPES_CONNUS.includes(t));
if (inconnus.length) throw new Error(`Type(s) inconnu(s) dans le CSV : ${inconnus.join(", ")}`);

writeFileSync(OUT, JSON.stringify(prouesses, null, 2) + "\n");
console.log(`${prouesses.length}/${lignes.length} prouesses (statut ${[...STATUTS_RETENUS].join(", ")}) -> src/data/prouesses.json`);
