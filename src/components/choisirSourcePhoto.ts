import { Alert, Platform } from 'react-native';

export type SourcePhoto = 'appareil' | 'pellicule';

// Appareil photo ou pellicule pour valider une prouesse ; null si le joueur annule.
// Alert n'affiche pas de boutons sur le web : le sélecteur de fichiers du navigateur
// propose déjà les deux.
export function choisirSourcePhoto(titre: string) {
  if (Platform.OS === 'web') return Promise.resolve<SourcePhoto | null>('pellicule');
  return new Promise<SourcePhoto | null>((resolve) =>
    Alert.alert(
      titre,
      'Prenez la photo sur place ou choisissez-la dans votre pellicule.',
      [
        { text: 'Prendre une photo', onPress: () => resolve('appareil') },
        { text: 'Choisir dans la pellicule', onPress: () => resolve('pellicule') },
        { text: 'Annuler', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    ),
  );
}
