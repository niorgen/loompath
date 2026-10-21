// Généré depuis src/data/Pictos.dc.html (planche « Pictogrammes des tags »)
// Tracés 24×24 en trait (stroke-width 1.8) ; couleur propre aux types, lavande pour le reste
export type Picto = { couleur: string; trace: string };

export const PICTOS: Record<string, Picto> = {
  // Types
  'Secret': { couleur: '#FFC98A', trace: "<path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z'/><circle cx='12' cy='12' r='3'/>" },
  'Mickeys cachés': { couleur: '#F5A3C7', trace: "<circle cx='10.5' cy='10.5' r='6.5'/><path d='m20 20-4.5-4.5'/><path d='M10.5 7.2l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z'/>" },
  'Personnages': { couleur: '#8FD0FF', trace: "<circle cx='9' cy='8' r='3.5'/><path d='M2.5 20a6.5 6.5 0 0 1 13 0'/><path d='M16 4.5a3.5 3.5 0 0 1 0 7'/><path d='M18 14.5a6.5 6.5 0 0 1 3.5 5.5'/>" },
  'Attraction': { couleur: '#C9B6FF', trace: "<path d='M2 17c3 0 4-11 8-11s4 7 6 7 3-3 6-3'/><path d='M2 21h20'/><path d='M6 21v-5M10 21V7M16 21v-7M20 21v-9'/>" },
  'Spectacles': { couleur: '#FF9E8A', trace: "<circle cx='12' cy='12' r='1.5'/><path d='M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8'/>" },
  'Point photo': { couleur: '#9EE6D4', trace: "<path d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z'/><circle cx='12' cy='13' r='3.5'/>" },
  'Chasse au trésor': { couleur: '#E6D98F', trace: "<rect x='3' y='10' width='18' height='10' rx='2'/><path d='M3 10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4'/><path d='M3 14h18'/><rect x='10.5' y='12.5' width='3' height='3.5' rx='1'/>" },
  // Thèmes
  'Festival Halloween': { couleur: '#C9B6FF', trace: "<path d='M12 7c-5 0-8 3-8 7s3 6 8 6 8-2 8-6-3-7-8-7z'/><path d='M12 7c-2 0-3 3-3 6.5S10 20 12 20s3-3 3-6.5S14 7 12 7z'/><path d='M12 7V4.5c0-.8.6-1.5 1.5-1.5'/>" },
  'Plantes': { couleur: '#C9B6FF', trace: "<path d='M5 19c0-9 6-14 15-14 0 9-5 15-14 15'/><path d='M5 19l8-8'/>" },
  'World Princess Week': { couleur: '#C9B6FF', trace: "<path d='M3 8l4 4 5-7 5 7 4-4-2 11H5z'/><path d='M5 19h14'/>" },
  'Fantasyland (thème)': { couleur: '#C9B6FF', trace: "<path d='M3 20 12 4l9 16'/><path d='M12 4v16'/><path d='M3 20h18'/><path d='M8 20l4-6 4 6'/>" },
  // Parcs et sites
  'Disneyland Park': { couleur: '#C9B6FF', trace: "<path d='M4 21V11l2-2 2 2v10'/><path d='M16 21V11l2-2 2 2v10'/><path d='M8 21v-7h8v7'/><path d='M10 14V8l2-3 2 3v6'/><path d='M3 21h18'/><path d='M11 21v-3a1 1 0 0 1 2 0v3'/>" },
  'Disney Adventure World': { couleur: '#C9B6FF', trace: "<rect x='3' y='9' width='18' height='12' rx='2'/><path d='M3 9 4.3 4.2l16.4 2.9L21 9'/><path d='M8.3 4.9 9.8 8.6M13.6 5.8l1.5 3.4'/>" },
  'Hôtels': { couleur: '#C9B6FF', trace: "<path d='M3 19V6'/><path d='M3 14h18v5'/><path d='M21 14v-2a3 3 0 0 0-3-3h-7v5'/><circle cx='7' cy='11' r='2'/>" },
  'Disney Village': { couleur: '#C9B6FF', trace: "<path d='M5 8h14l-1 13H6z'/><path d='M9 8V6a3 3 0 0 1 6 0v2'/>" },
  // Lands · Disneyland Park
  'Main Street U.S.A.': { couleur: '#C9B6FF', trace: "<path d='M12 21V9'/><path d='M9 21h6'/><path d='M8.5 9h7l-1-4h-5z'/><path d='M12 5V3'/>" },
  'Frontierland': { couleur: '#C9B6FF', trace: "<path d='M10 21V5a2 2 0 0 1 4 0v16'/><path d='M14 13h2a2 2 0 0 0 2-2V8'/><path d='M10 11H8a2 2 0 0 1-2-2V7'/><path d='M6 21h12'/>" },
  'Adventureland': { couleur: '#C9B6FF', trace: "<path d='M12 21c0-5 .5-9 1-12'/><path d='M13 9c-2-3-5-3-8-2'/><path d='M13 9c1-3 4-4 7-3'/><path d='M13 9c-3 0-5 2-6 5'/><path d='M13 9c3 0 5 2 5 5'/><path d='M8 21h9'/>" },
  'Fantasyland': { couleur: '#C9B6FF', trace: "<path d='M2 6h7a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H2z'/><path d='M22 6h-7a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H22z'/><path d='M17 1.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z'/>" },
  'Discoveryland': { couleur: '#C9B6FF', trace: "<path d='M12 2c3 2 5 6 5 10l-2 4H9l-2-4c0-4 2-8 5-10z'/><circle cx='12' cy='10' r='2'/><path d='M9 16l-3 3v-4l1-1M15 16l3 3v-4l-1-1'/><path d='M11 20h2'/>" },
  // Lands · Disney Adventure World
  'World Premiere': { couleur: '#C9B6FF', trace: "<path d='m12 4 2.2 4.6 5 .7-3.6 3.5.9 5L12 15.4l-4.5 2.4.9-5-3.6-3.5 5-.7z'/><path d='M4 21h16'/>" },
  'Adventure Way': { couleur: '#C9B6FF', trace: "<path d='M12 3v18'/><path d='M12 6h7l2 2-2 2h-7'/><path d='M12 12H5l-2 2 2 2h7'/><path d='M8 21h8'/>" },
  'World of Frozen': { couleur: '#C9B6FF', trace: "<path d='M12 12L12.00 2.00 M12.00 5.80L10.07 3.50 M12.00 5.80L13.93 3.50 M12 12L3.34 7.00 M6.63 8.90L3.68 9.42 M6.63 8.90L5.60 6.08 M12 12L3.34 17.00 M6.63 15.10L5.60 17.92 M6.63 15.10L3.68 14.58 M12 12L12.00 22.00 M12.00 18.20L13.93 20.50 M12.00 18.20L10.07 20.50 M12 12L20.66 17.00 M17.37 15.10L20.32 14.58 M17.37 15.10L18.40 17.92 M12 12L20.66 7.00 M17.37 8.90L18.40 6.08 M17.37 8.90L20.32 9.42'/>" },
  'Worlds of Pixar': { couleur: '#C9B6FF', trace: "<path d='M12 2 21 7v10l-9 5-9-5V7z'/><path d='M3 7l9 5 9-5'/><path d='M12 12v10'/>" },
  'Marvel Avengers Campus': { couleur: '#C9B6FF', trace: "<circle cx='12' cy='12' r='9.5'/><circle cx='12' cy='12' r='5.5'/><path d='M12.6 9.3 10.6 12.3h2l-.9 2.4'/>" },
  'Production Courtyard': { couleur: '#C9B6FF', trace: "<rect x='2' y='9' width='14' height='10' rx='2'/><path d='m16 13 6-3v8l-6-3'/><circle cx='6' cy='6' r='2.5'/><circle cx='12' cy='6' r='2.5'/>" },
  // Hôtels
  'Disneyland Hotel': { couleur: '#C9B6FF', trace: "<path d='M3 21h18'/><path d='M5 21V11h14v10'/><path d='M8 11a4 4 0 0 1 8 0'/><path d='M12 7V4'/><path d='M9 21v-5h6v5'/>" },
  'Hotel New York': { couleur: '#C9B6FF', trace: "<path d='M3 21h18'/><path d='M5 21V8h5v13'/><path d='M10 21V3h5v18'/><path d='M15 21v-9h4v9'/><path d='M12.5 7h0M12.5 11h0M12.5 15h0'/>" },
  'Newport Bay Club': { couleur: '#C9B6FF', trace: "<path d='M9 21 10 8h4l1 13'/><path d='M8 8h8'/><path d='M10 8V5l2-2 2 2v3'/><path d='M6 21h12'/><path d='M9.5 13h5'/>" },
  'Sequoia Lodge': { couleur: '#C9B6FF', trace: "<path d='M12 2 6 10h3l-4 6h14l-4-6h3z'/><path d='M12 16v6'/>" },
  'Hotel Cheyenne': { couleur: '#C9B6FF', trace: "<path d='M2 15c2 3 18 3 20 0'/><path d='M6 15c0-5 1-9 3-9 1 0 2 1 3 1s2-1 3-1c2 0 3 4 3 9'/>" },
  'Hotel Santa Fe': { couleur: '#C9B6FF', trace: "<path d='M8 3 4 21'/><path d='M16 3l4 18'/><path d='M12 5v2M12 11v3M12 18v3'/>" },
  'Davy Crockett Ranch': { couleur: '#C9B6FF', trace: "<path d='M3 11 12 4l9 7'/><path d='M5 10v11h14V10'/><path d='M5 14h14M5 17.5h14'/><path d='M10 21v-4h4v4'/>" },
};
