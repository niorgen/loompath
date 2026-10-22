import { Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Lora_700Bold } from '@expo-google-fonts/lora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useProfil } from '@/state/profil';
import { colors } from '@/theme';

// Le splash reste affiché jusqu'à ce que l'app soit prête à s'afficher
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold, Inter_800ExtraBold, Lora_700Bold });
  const profil = useProfil();
  const pret = fontsLoaded && profil.charge;

  useEffect(() => {
    if (pret) SplashScreen.hideAsync();
  }, [pret]);

  // Le profil doit être lu pour savoir s'il faut montrer l'introduction
  if (!pret) return null;

  return (
    <>
      <StatusBar style="light" />
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
    </>
  );
}
