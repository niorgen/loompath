import { StyleSheet, View } from 'react-native';

import { CarteLand } from '@/components/CarteLand';
import type { Categorie } from '@/data';

type Props = {
  categories: Categorie[];
  onPress: (categorie: Categorie) => void;
};

// Grille de cartes deux par deux (parcs, lands, catégories du carnet)
export function GrilleCategories({ categories, onPress }: Props) {
  const lignes = Array.from({ length: Math.ceil(categories.length / 2) }, (_, i) => categories.slice(i * 2, i * 2 + 2));
  return (
    <View style={styles.grille}>
      {lignes.map((ligne) => (
        <View key={ligne[0].id} style={styles.ligne}>
          {/* Cases sans padding : la carte seule d'une ligne garde la largeur d'une colonne */}
          {ligne.map((categorie) => (
            <View key={categorie.id} style={styles.case}>
              <CarteLand
                nom={categorie.nom}
                obtenues={categorie.obtenues}
                total={categorie.total}
                onPress={() => onPress(categorie)}
              />
            </View>
          ))}
          {ligne.length === 1 ? <View style={styles.case} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grille: {
    gap: 16,
  },
  ligne: {
    flexDirection: 'row',
    gap: 16,
  },
  case: {
    flex: 1,
  },
});
