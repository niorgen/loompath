import { useEffect, useMemo, useRef, useState } from 'react';

import { construireHtmlCarte, type DonneesCarte, type MessageCarte } from './carteHtml';

type Props = {
  donnees: DonneesCarte;
  margeBas: number;
  /** Carte figée du Journal (voir construireHtmlCarte) */
  apercu?: boolean;
  onMessage: (message: MessageCarte) => void;
};

type FenetreCarte = Window & { majDonnees?: (donnees: DonneesCarte) => void };

// Version web : react-native-webview n'existe pas sur le web, on passe par une iframe
export function CarteLeaflet({ donnees, margeBas, apercu, onMessage }: Props) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [prete, setPrete] = useState(false);
  const html = useMemo(() => construireHtmlCarte({ margeBas, apercu }), [margeBas, apercu]);

  useEffect(() => {
    const recevoir = (event: MessageEvent) => {
      if (event.source !== iframe.current?.contentWindow || typeof event.data !== 'string') return;
      const message = JSON.parse(event.data) as MessageCarte | { type: 'pret' };
      if (message.type === 'pret') setPrete(true);
      else onMessage(message);
    };
    window.addEventListener('message', recevoir);
    return () => window.removeEventListener('message', recevoir);
  }, [onMessage]);

  useEffect(() => {
    if (prete) (iframe.current?.contentWindow as FenetreCarte | null)?.majDonnees?.(donnees);
  }, [prete, donnees]);

  return (
    <iframe
      ref={iframe}
      srcDoc={html}
      title="Carte du parc"
      style={{ flex: 1, width: '100%', height: '100%', border: 0, display: 'block' }}
    />
  );
}
