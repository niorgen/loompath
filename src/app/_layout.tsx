import { Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Lora_700Bold } from '@expo-google-fonts/lora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { SplashAnime } from '@/components/SplashAnime';
import { useProfil } from '@/state/profil';
import { colors } from '@/theme';

// Le splash natif reste affiché jusqu'à ce que les polices soient chargées,
// puis le splash animé prend le relais jusqu'à ce que l'app soit prête
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

// Version web : l'app est en français (le gabarit HTML d'Expo déclare « en »), pour la prononciation
// des lecteurs d'écran (RGAA 8.3)
if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.lang = 'fr';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold, Inter_800ExtraBold, Lora_700Bold });
  const profil = useProfil();
  const [splashAnime, setSplashAnime] = useState(true);
  const masquerSplash = useCallback(() => setSplashAnime(false), []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Le titre du splash animé utilise les polices de l'app
  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      {/* Le profil doit être lu pour savoir s'il faut montrer l'introduction */}
      {profil.charge ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          {/* Introduction au premier lancement (ou relancée depuis le Profil), l'app ensuite */}
          <Stack.Protected guard={profil.introVue}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="prouesse/[id]" />
            <Stack.Screen name="validation/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          </Stack.Protected>
          <Stack.Protected guard={!profil.introVue}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
        </Stack>
      ) : null}
      {splashAnime ? <SplashAnime pret={profil.charge} onTermine={masquerSplash} /> : null}
    </>
  );
}
