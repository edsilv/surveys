'use client';

import i18next from '@/app/i18n/i18next';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fallbackLng } from '@/app/i18n/settings';

const runsOnServerSide = typeof window === 'undefined';

type UseTranslationArgs = Parameters<typeof useTranslation>;

export function useT(...[ns, options]: UseTranslationArgs) {
  const lngParam = useParams()?.lng;
  const hasUrlLanguage = typeof lngParam === 'string' && lngParam.length > 0;

  const desiredLanguage = hasUrlLanguage ? (lngParam as string) : (i18next.resolvedLanguage ?? fallbackLng);

  if (runsOnServerSide && desiredLanguage) {
    if (i18next.resolvedLanguage !== desiredLanguage) {
      i18next.changeLanguage(desiredLanguage);
    }
  }

  useEffect(() => {
    if (runsOnServerSide || !desiredLanguage) {
      return;
    }

    if (i18next.language !== desiredLanguage) {
      void i18next.changeLanguage(desiredLanguage);
    }
  }, [desiredLanguage]);

  return useTranslation(ns, options);
}
