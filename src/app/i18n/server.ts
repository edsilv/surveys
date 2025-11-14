import i18next from './i18next';
import { headerName, fallbackLng } from './settings';
import { headers } from 'next/headers';

type Namespace = 'client-page' | 'server-page';

interface GetTOptions {
  keyPrefix?: string;
}

// use for server-side translation fetching
export async function getT(ns: Namespace = 'server-page', options?: GetTOptions) {
  const headerList = await headers();
  const lng = headerList.get(headerName) || fallbackLng;
  const namespace = ns;

  // console.log('getT', { lng, ns, options });

  // On server side, we need to ensure the language is set correctly
  if (typeof window === 'undefined') {
    // console.log('Server-side: Before language change -', {
    //   language: i18next.language,
    //   resolvedLanguage: i18next.resolvedLanguage,
    // });

    // Wait for i18next to be ready
    if (!i18next.isInitialized) {
      await new Promise((resolve) => {
        if (i18next.isInitialized) {
          resolve(void 0);
        } else {
          i18next.on('initialized', resolve);
        }
      });
    }

    // Change language and wait for completion
    await i18next.changeLanguage(lng);

    // console.log('Server-side: After language change -', {
    //   language: i18next.language,
    //   resolvedLanguage: i18next.resolvedLanguage,
    // });
  }

  // Load namespace if needed
  if (namespace && !i18next.hasLoadedNamespace(namespace)) {
    // console.log('Loading namespace:', ns);
    await i18next.loadNamespaces(namespace);
    // console.log('Namespace loaded successfully');
  }

  // console.log('Final state:', {
  //   language: i18next.language,
  //   resolvedLanguage: i18next.resolvedLanguage,
  //   usingLanguage: lng,
  // });

  return {
    t: i18next.getFixedT(lng, namespace, options?.keyPrefix),
    i18n: i18next,
  };
}
