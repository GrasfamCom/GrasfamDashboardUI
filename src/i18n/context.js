import { createContext, useContext } from 'react';

export const DEFAULT_LANG = 'en';

export const I18nContext = createContext({
  lang: DEFAULT_LANG,
  t: (key) => key,
  changeLang: () => {},
});

/**
 * useTranslation — returns { t, lang, changeLang } from the nearest I18nProvider.
 */
export const useTranslation = () => useContext(I18nContext);
