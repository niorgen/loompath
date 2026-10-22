import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { IndiceRow } from '@/components/IndiceRow';
import type { Prouesse } from '@/data';
import { colors, fonts } from '@/theme';

// Prouesses trouvées par une recherche, listées au-dessus des catégories qui correspondent
export function ResultatsProuesses({ prouesses }: { prouesses: Prouesse[] }) {
  if (!prouesses.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.titre} accessibilityRole="header">
        Prouesses
      </Text>
      <View style={styles.liste}>
        {prouesses.map((prouesse) => (
          <IndiceRow
            key={prouesse.id}
            titre={prouesse.titre}
            indice={prouesse.sousTitre}
            obtenue={prouesse.obtenue}
            onPress={() => router.push(`/prouesse/${prouesse.id}`)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  titre: {
    fontFamily: fonts.loraBold,
    fontSize: 23,
    lineHeight: 23 * 1.1,
    color: colors.textPrimaryAlt,
  },
  liste: {
    gap: 8,
  },
});
