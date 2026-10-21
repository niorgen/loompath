// Complète app.json. EXPO_BASE_URL sert au déploiement web sous un sous-chemin
// (GitHub Pages : https://niorgen.github.io/loompath/ -> EXPO_BASE_URL=/loompath) ;
// sans elle, l'app web reste servie à la racine (npm run web).
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
