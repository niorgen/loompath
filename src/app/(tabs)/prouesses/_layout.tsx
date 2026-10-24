import { Stack } from 'expo-router';

import { avecFondNuit } from '@/components/Fonds';
import { colors } from '@/theme';

export default function ProuessesLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      screenLayout={avecFondNuit}
    />
  );
}
