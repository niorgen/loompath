import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { colors } from '@/theme';

import { construireHtmlCarte, type DonneesCarte, type MessageCarte } from './carteHtml';

type Props = {
  donnees: DonneesCarte;
  margeBas: number;
  onMessage: (message: MessageCarte) => void;
};

export function CarteLeaflet({ donnees, margeBas, onMessage }: Props) {
  const webview = useRef<WebView>(null);
  const [prete, setPrete] = useState(false);
  // La page n'est construite qu'une fois : les données passent ensuite par majDonnees
  const html = useMemo(() => construireHtmlCarte({ margeBas }), [margeBas]);

  useEffect(() => {
    if (prete) webview.current?.injectJavaScript(`window.majDonnees(${JSON.stringify(donnees)}); true;`);
  }, [prete, donnees]);

  const recevoir = (event: WebViewMessageEvent) => {
    const message = JSON.parse(event.nativeEvent.data) as MessageCarte | { type: 'pret' };
    if (message.type === 'pret') setPrete(true);
    else onMessage(message);
  };

  return (
    <WebView
      ref={webview}
      source={{ html, baseUrl: 'https://loompath.app/' }}
      originWhitelist={['*']}
      onMessage={recevoir}
      style={styles.carte}
      containerStyle={styles.carte}
      overScrollMode="never"
      bounces={false}
      setSupportMultipleWindows={false}
    />
  );
}

const styles = StyleSheet.create({
  carte: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
