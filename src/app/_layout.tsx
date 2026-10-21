import { Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Lora_700Bold } from '@expo-google-fonts/lora';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { useProfil } from '@/state/profil';
import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold, Inter_800ExtraBold, Lora_700Bold });
  const profil = useProfil();

  // Le profil doit être lu pour savoir s'il faut montrer l'introduction
  if (!fontsLoaded || !profil.charge) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {/* Introduction au premier lancement (ou relancée depuis le Profil), l'app ensuite */}
        <Stack.Protected guard={profil.introVue}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="prouesse/[id]" />
        </Stack.Protected>
        <Stack.Protected guard={!profil.introVue}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
