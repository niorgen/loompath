// Complète app.json. EXPO_BASE_URL sert au déploiement web sous un sous-chemin
// (GitHub Pages : https://niorgen.github.io/loompath/ -> EXPO_BASE_URL=/loompath) ;
// sans elle, l'app web reste servie à la racine (npm run web).
// APP_VARIANT=dev : build de développement local (npx expo run:android), installé à côté de l'app
// de production sous un autre nom de paquet, sans toucher à ses données. Les builds EAS ne la définissent pas.
const dev = process.env.APP_VARIANT === 'dev';

module.exports = ({ config }) => ({
  ...config,
  ...(dev
    ? {
        name: `${config.name} (dev)`,
        scheme: `${config.scheme}-dev`,
        android: { ...config.android, package: `${config.android.package}.dev` },
      }
    : {}),
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
