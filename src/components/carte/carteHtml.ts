import { colors } from '@/theme';

// Données envoyées à la carte Leaflet
export type PointProuesse = {
  id: string;
  titre: string;
  latitude: number;
  longitude: number;
  obtenue: boolean;
};

export type PointPhoto = {
  id: string;
  titre: string;
  latitude: number;
  longitude: number;
  miniature: string;
};

export type DonneesCarte = {
  points: PointProuesse[];
  photos: PointPhoto[];
  /** Prouesse sur laquelle centrer la carte (ex. « Voir sur la carte » après une validation) */
  centre?: { id: string; latitude: number; longitude: number };
};

// Messages renvoyés par la carte
export type MessageCarte = { type: 'prouesse'; id: string };

// assets/icons/pin-image.svg (badge des pins photo), tel qu'exporté depuis Figma
const ICONE_IMAGE = `<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="image" clip-path="url(#clip0_0_126)"><path id="Vector" d="M8.75 6.24987L7.46417 4.96404C7.30789 4.80781 7.09597 4.72005 6.875 4.72005C6.65403 4.72005 6.44211 4.80781 6.28583 4.96404L2.5 8.74987M2.08333 1.25H7.91667C8.3769 1.25 8.75 1.6231 8.75 2.08333V7.91667C8.75 8.3769 8.3769 8.75 7.91667 8.75H2.08333C1.6231 8.75 1.25 8.3769 1.25 7.91667V2.08333C1.25 1.6231 1.6231 1.25 2.08333 1.25ZM4.58333 3.75C4.58333 4.21024 4.21024 4.58333 3.75 4.58333C3.28976 4.58333 2.91667 4.21024 2.91667 3.75C2.91667 3.28976 3.28976 2.91667 3.75 2.91667C4.21024 2.91667 4.58333 3.28976 4.58333 3.75Z" stroke="white" stroke-linecap="round"/></g><defs><clipPath id="clip0_0_126"><rect width="10" height="10" fill="white"/></clipPath></defs></svg>`;

// Clé CARTO Basemaps (gratuite : https://carto.com/basemaps/apikey), lue depuis .env.
// Sans clé, les tuiles s'affichent avec le filigrane « API key required ».
const CLE_CARTO = process.env.EXPO_PUBLIC_CARTO_API_KEY ?? '';
const TUILES = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${
  CLE_CARTO ? `?key=${encodeURIComponent(CLE_CARTO)}` : ''
}`;

// Emprise du resort (prouesses du CSV, du Davy Crockett Ranch au nord des hôtels) + une marge :
// aucune tuile n'est chargée en dehors, et la carte ne peut pas s'en éloigner
const EMPRISE = [
  [48.828, 2.763],
  [48.882, 2.833],
];
const ZOOM_MIN = 13;

// Le fond Dark Matter est en niveaux de gris : chaque gris est remplacé par une couleur du thème
// (luminance -> couleur). Fond de carte ~0.1, bâtiments ~0.2, routes ~0.25, libellés ~0.45.
// Appliqué aux seules tuiles : pins et photos gardent leurs couleurs.
const DEGRADE_TUILES: [number, string][] = [
  [0, colors.background],
  [0.1, colors.surfaceRow],
  [0.2, colors.surfacePlaceholder],
  [0.3, colors.border],
  [0.5, colors.action],
  [0.7, colors.accent],
  [1, colors.textPrimary],
];

// Tables feComponentTransfer (R, G, B) échantillonnant le dégradé ci-dessus
function tablesDegrade(echantillons = 21) {
  const canal = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return [0, 1, 2].map((i) =>
    Array.from({ length: echantillons }, (_, n) => {
      const t = n / (echantillons - 1);
      const fin = DEGRADE_TUILES.findIndex(([position]) => position >= t);
      const [p1, c1] = DEGRADE_TUILES[Math.max(fin - 1, 0)];
      const [p2, c2] = DEGRADE_TUILES[fin];
      const k = p2 === p1 ? 0 : (t - p1) / (p2 - p1);
      return (canal(c1, i) + (canal(c2, i) - canal(c1, i)) * k).toFixed(3);
    }).join(' '),
  );
}

const [TABLE_R, TABLE_V, TABLE_B] = tablesDegrade();
const FILTRE_TUILES = `<svg width="0" height="0" style="position:absolute"><filter id="teinte" color-interpolation-filters="sRGB">
<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"/>
<feComponentTransfer><feFuncR type="table" tableValues="${TABLE_R}"/><feFuncG type="table" tableValues="${TABLE_V}"/><feFuncB type="table" tableValues="${TABLE_B}"/></feComponentTransfer>
</filter></svg>`;

const LEAFLET = 'https://unpkg.com/leaflet@1.9.4/dist';
const CLUSTER = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist';

/**
 * Page Leaflet autonome (fond CARTO Dark Matter, points des prouesses + pins photo regroupés).
 * L'app pousse les données via window.majDonnees(donnees) ; la carte répond par
 * des messages JSON (ReactNativeWebView sur mobile, window.parent sur le web).
 */
export function construireHtmlCarte({ margeBas }: { margeBas: number }) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${LEAFLET}/leaflet.css" />
<link rel="stylesheet" href="${CLUSTER}/MarkerCluster.css" />
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap" />
<style>
  html, body, #carte { margin: 0; height: 100%; background: ${colors.background}; }
  .leaflet-container { background: ${colors.background}; font-family: Inter, system-ui, sans-serif; }
  .leaflet-tile-pane { filter: url(#teinte); }
  .leaflet-bottom { bottom: ${margeBas}px; }
  .leaflet-control-attribution {
    background: rgba(5, 8, 22, 0.6) !important; color: ${colors.textSecondary};
    font-size: 9px; border-radius: 6px 0 0 6px;
  }
  .leaflet-control-attribution a { color: ${colors.accentSecondary}; }
  .leaflet-div-icon, .marker-cluster { background: none; border: none; }

  .pin { position: relative; width: 52px; height: 52px; }
  .vignette {
    position: absolute; top: 0; width: 48px; height: 48px; box-sizing: border-box;
    border: 3.5px solid #4c8fd8; border-radius: 24px;
    background: ${colors.surface} center / cover no-repeat;
    box-shadow: 0 6px 14px 0 rgba(2, 6, 23, 0.55);
  }
  .pin .vignette { left: 2px; }
  .groupe .vignette { left: 0; }
  .badge {
    position: absolute; left: 32px; top: 32px; width: 18px; height: 18px; border-radius: 9px;
    background: #477fc4; display: flex; align-items: center; justify-content: center;
    filter: drop-shadow(0 2px 2.5px rgba(2, 6, 23, 0.45));
  }
  .compteur {
    position: absolute; left: 30px; top: 30px; width: 22px; height: 22px; border-radius: 11px;
    background: #477fc4; box-shadow: 0 5px 12px -2px rgba(2, 6, 23, 0.55);
    display: flex; align-items: center; justify-content: center;
    font: 800 10px Inter, system-ui, sans-serif; color: ${colors.textPrimaryAlt};
  }
</style>
</head>
<body>
${FILTRE_TUILES}
<div id="carte"></div>
<script src="${LEAFLET}/leaflet.js"></script>
<script src="${CLUSTER}/leaflet.markercluster.js"></script>
<script>
  var ICONE_IMAGE = ${JSON.stringify(ICONE_IMAGE)};

  function envoyer(message) {
    var json = JSON.stringify(message);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(json);
    else if (window.parent !== window) window.parent.postMessage(json, '*');
  }

  var EMPRISE = ${JSON.stringify(EMPRISE)};
  var carte = L.map('carte', {
    zoomControl: false,
    attributionControl: true,
    minZoom: ${ZOOM_MIN},
    maxBounds: EMPRISE,
    maxBoundsViscosity: 1,
  });
  carte.attributionControl.setPrefix(false);
  carte.setView([48.8705, 2.7775], 16);

  L.tileLayer(${JSON.stringify(TUILES)}, {
    subdomains: 'abcd',
    bounds: EMPRISE,
    minZoom: ${ZOOM_MIN},
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(carte);

  var couchePoints = L.layerGroup().addTo(carte);
  var couchePhotos = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 56,
    iconCreateFunction: function (groupe) {
      var premiere = groupe.getAllChildMarkers()[0].options.miniature;
      return L.divIcon({
        className: '',
        iconSize: [52, 52],
        html: '<div class="pin groupe"><div class="vignette" style="background-image:url(' + premiere + ')"></div>' +
              '<div class="compteur">' + groupe.getChildCount() + '</div></div>',
      });
    },
  }).addTo(carte);

  var cadree = false;
  var centreId = null;

  window.majDonnees = function (donnees) {
    couchePoints.clearLayers();
    couchePhotos.clearLayers();

    donnees.points.forEach(function (p) {
      L.circleMarker([p.latitude, p.longitude], {
        radius: 6, weight: 2, color: '${colors.background}',
        fillColor: p.obtenue ? '${colors.accent}' : '${colors.textSecondary}', fillOpacity: 0.95,
      })
        .bindTooltip(p.titre, { direction: 'top', offset: [0, -6] })
        .on('click', function () { envoyer({ type: 'prouesse', id: p.id }); })
        .addTo(couchePoints);
    });

    donnees.photos.forEach(function (p) {
      L.marker([p.latitude, p.longitude], {
        miniature: p.miniature,
        title: p.titre,
        icon: L.divIcon({
          className: '',
          iconSize: [52, 52],
          html: '<div class="pin"><div class="vignette" style="background-image:url(' + p.miniature + ')"></div>' +
                '<div class="badge">' + ICONE_IMAGE + '</div></div>',
        }),
      })
        .on('click', function () { envoyer({ type: 'prouesse', id: p.id }); })
        .addTo(couchePhotos);
    });

    // Centrage demandé sur une prouesse : une fois par prouesse, il remplace le cadrage initial
    if (donnees.centre && donnees.centre.id !== centreId) {
      centreId = donnees.centre.id;
      cadree = true;
      carte.setView([donnees.centre.latitude, donnees.centre.longitude], 18);
    }

    // Cadrage initial sur le parc, une seule fois pour ne pas perdre la position du joueur
    if (!cadree && donnees.points.length) {
      cadree = true;
      carte.fitBounds(donnees.points.map(function (p) { return [p.latitude, p.longitude]; }), {
        paddingTopLeft: [16, 100], paddingBottomRight: [16, ${margeBas}],
        // Avec une ou deux prouesses validées, éviter de zoomer au niveau de la rue
        maxZoom: 17,
      });
    }
  };

  envoyer({ type: 'pret' });
</script>
</body>
</html>`;
}
