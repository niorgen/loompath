import { router, type Href } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';

import { NavigationMenu, type Destination } from '@/components/NavigationMenu';
import { colors } from '@/theme';

// Destinations de la barre ↔ onglets de ce groupe
const ONGLETS: Record<Destination, { route: string; href: Href }> = {
  journal: { route: 'index', href: '/' },
  prouesse: { route: 'prouesses', href: '/prouesses' },
  cartes: { route: 'cartes', href: '/cartes' },
  chroniques: { route: 'chroniques', href: '/chroniques' },
  profil: { route: 'profil', href: '/profil' },
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const routeActive = state.routes[state.index].name;
  const actif =
    (Object.keys(ONGLETS) as Destination[]).find((d) => ONGLETS[d]?.route === routeActive) ?? 'journal';

  return (
    <NavigationMenu
      actif={actif}
      // navigate ramène aussi à la racine de l'onglet (ex. du détail vers la liste)
      onSelect={(destination) => {
        const onglet = ONGLETS[destination];
        if (!onglet) return;
        // La barre étant personnalisée, on émet nous-mêmes tabPress pour que l'écran puisse réagir
        const route = state.routes.find((r) => r.name === onglet.route);
        if (route) navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        router.navigate(onglet.href);
      }}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="prouesses" />
      <Tabs.Screen name="cartes" />
      <Tabs.Screen name="chroniques" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
