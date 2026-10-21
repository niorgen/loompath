import { Alert, Platform } from 'react-native';

// Confirmation d'une action destructrice. Alert n'affiche pas de boutons sur le web :
// on passe alors par la confirmation du navigateur.
export function confirmer(titre: string, message: string, libelle: string) {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${titre}\n\n${message}`));
  return new Promise<boolean>((resolve) =>
    Alert.alert(titre, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
      { text: libelle, style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}
