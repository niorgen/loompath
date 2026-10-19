// Convertit src/data/prouesses.csv en src/data/prouesses.json
// Usage : npm run data (à relancer après chaque modification du CSV)
import { readFileSync, writeFileSync } from "node:fs";

const SRC = new URL("../src/data/prouesses.csv", import.meta.url);
const OUT = new URL("../src/data/prouesses.json", import.meta.url);

// Seules les prouesses prêtes sont publiées dans l'app
const STATUTS_RETENUS = new Set(["Validé"]);

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
  return data.map(r => Object.fromEntries(header.map((h, i) => [h.replace(/^﻿/, "").trim(), (r[i] ?? "").trim()])));
}

// "48.866153, 2.77663" -> { latitude, longitude } (absent si vide ou invalide)
function coordonnees(brut) {
  const [latitude, longitude] = brut.split(",").map(v => parseFloat(v));
  return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : {};
}

const lignes = parseCSV(readFileSync(SRC, "utf8"));
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
    ...coordonnees(l["Coordonnées GPS"]),
  }));

const TYPES_CONNUS = ["Attraction", "Spectacles", "Personnages", "Secret", "Point photo", "Mickeys cachés", "Chasse au trésor"];
const types = new Set(prouesses.map(p => p.type).filter(Boolean));
const inconnus = [...types].filter(t => !TYPES_CONNUS.includes(t));
if (inconnus.length) throw new Error(`Type(s) inconnu(s) dans le CSV : ${inconnus.join(", ")}`);

writeFileSync(OUT, JSON.stringify(prouesses, null, 2) + "\n");
console.log(`${prouesses.length}/${lignes.length} prouesses (statut ${[...STATUTS_RETENUS].join(", ")}) -> src/data/prouesses.json`);
