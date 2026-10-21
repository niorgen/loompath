import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

// Profil du joueur, conservé sur l'appareil : son nom et le passage par l'introduction
const CLE_STOCKAGE = 'loompath:profil';

export const NOM_MIN = 2;
export const NOM_MAX = 20;

export const nomValide = (nom: string) => nom.trim().length >= NOM_MIN;

type Profil = {
  /** false tant que le stockage n'a pas été lu (l'app attend avant de choisir entre intro et onglets) */
  charge: boolean;
  nom: string;
  introVue: boolean;
};

let profil: Profil = { charge: false, nom: '', introVue: false };
const abonnes = new Set<() => void>();

function publier(suivant: Profil) {
  profil = suivant;
  abonnes.forEach((notifier) => notifier());
}

async function enregistrer(modifs: Partial<Omit<Profil, 'charge'>>) {
  publier({ ...profil, ...modifs });
  const { nom, introVue } = profil;
  await AsyncStorage.setItem(CLE_STOCKAGE, JSON.stringify({ nom, introVue }));
}

AsyncStorage.getItem(CLE_STOCKAGE)
  .then((brut) => {
    const stocke = brut ? (JSON.parse(brut) as Partial<Profil>) : {};
    publier({ charge: true, nom: stocke.nom ?? '', introVue: !!stocke.introVue });
  })
  .catch(() => {
    // Stockage illisible : le joueur repasse par l'introduction
    publier({ ...profil, charge: true });
  });

export const definirNom = (nom: string) => enregistrer({ nom: nom.trim().slice(0, NOM_MAX) });

export const terminerIntroduction = () => enregistrer({ introVue: true });

// Relance l'introduction depuis le Profil (nom et prouesses conservés)
export const revoirIntroduction = () => enregistrer({ introVue: false });

export const effacerProfil = () => enregistrer({ nom: '', introVue: false });

function sAbonner(notifier: () => void) {
  abonnes.add(notifier);
  return () => abonnes.delete(notifier);
}

export function useProfil() {
  return useSyncExternalStore(sAbonner, () => profil);
}
