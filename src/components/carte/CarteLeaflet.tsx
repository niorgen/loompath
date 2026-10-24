import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';

import { colors } from '@/theme';

import { construireHtmlCarte, lireMessageCarte, URL_CARTE, type DonneesCarte, type MessageCarte } from './carteHtml';

type Props = {
  donnees: DonneesCarte;
  margeBas: number;
  /** Carte figée du Journal (voir construireHtmlCarte) */
  apercu?: boolean;
  onMessage: (message: MessageCarte) => void;
};

export function CarteLeaflet({ donnees, margeBas, apercu, onMessage }: Props) {
  const webview = useRef<WebView>(null);
  const [prete, setPrete] = useState(false);
  // La page n'est construite qu'une fois : les données passent ensuite par majDonnees
  const html = useMemo(() => construireHtmlCarte({ margeBas, apercu }), [margeBas, apercu]);

  useEffect(() => {
    if (prete) webview.current?.injectJavaScript(`window.majDonnees(${JSON.stringify(donnees)}); true;`);
  }, [prete, donnees]);

  const recevoir = (event: WebViewMessageEvent) => {
    const message = lireMessageCarte(event.nativeEvent.data);
    if (!message) return;
    if (message.type === 'pret') setPrete(true);
    else onMessage(message);
  };

  // La WebView n'affiche que la carte : tout autre lien (attributions…) s'ouvre dans le navigateur
  const autoriserNavigation = ({ url }: ShouldStartLoadRequest) => {
    if (url === URL_CARTE || url.startsWith('about:')) return true;
    if (/^https?:\/\//.test(url)) Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <WebView
      ref={webview}
      source={{ html, baseUrl: URL_CARTE }}
      originWhitelist={['*']}
      onShouldStartLoadWithRequest={autoriserNavigation}
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
