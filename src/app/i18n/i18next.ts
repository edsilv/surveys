import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { fallbackLng, languages, defaultNS } from './settings';

const runsOnServerSide = typeof window === 'undefined';

// Server-side: disable detection and use explicit language setting
// Client-side: use full detection capabilities
const config = runsOnServerSide
  ? {
      // Server configuration
      supportedLngs: languages,
      fallbackLng,
      lng: fallbackLng, // Set default on server, will be overridden per request
      fallbackNS: defaultNS,
      defaultNS,
      preload: languages, // Preload all languages on server
      initImmediate: false, // Don't init immediately, wait for proper setup
      interpolation: {
        escapeValue: false,
      },
    }
  : {
      // Client configuration
      supportedLngs: languages,
      fallbackLng,
      lng: undefined, // Let detect on client side
      fallbackNS: defaultNS,
      defaultNS,
      detection: {
        order: ['path', 'htmlTag', 'navigator'],
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
    };

// Initialize i18next with proper plugin chaining
let instance = i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)));

// Only add LanguageDetector on client side
if (!runsOnServerSide) {
  instance = instance.use(LanguageDetector);
}

instance.init(config);

export default i18next;
