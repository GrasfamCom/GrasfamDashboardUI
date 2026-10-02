import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LANG, I18nContext } from './context';
import enLang from './locales/en/en.json';
import idLang from './locales/id/id.json';

/**
 * Lightweight i18n for the Dashboard MFE (same provider as the Academic MFE).
 *
 * Avoids i18next / react-i18next packages because @originjs/vite-plugin-federation
 * cannot resolve them as shared entry modules during the production build.
 *
 * Instead we use a React Context + a simple `t(key, params)` function.
 * The language is synced from:
 *   1. localStorage "i18nextLng" on first load
 *   2. The Host navbar's "languageChanged" CustomEvent
 */

const LANG_KEY = 'i18nextLng';

const translations = { en: enLang, id: idLang };


/** Get the current language from localStorage, falling back to 'en'. */
const getStoredLang = () => {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'en' || stored === 'id' ? stored : DEFAULT_LANG;
};

/**
 * Translate a key, optionally interpolating {{param}} placeholders.
 * Falls back to the key itself if not found.
 */
const translate = (lang, key, params) => {
  const text = translations[lang]?.[key] ?? translations[DEFAULT_LANG]?.[key] ?? key;
  return text.replace(/\{\{(\w+)\}\}/g, (match, name) => (params?.[name] ?? match));
};

/**
 * I18nProvider — wrap the Dashboard MFE root so all children can call useTranslation().
 *
 * Listens for the Host's "languageChanged" event and updates the language reactively.
 */
export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(getStoredLang);

  // Listen for Host navbar language change — registered once
  useEffect(() => {
    const onHostLangChange = (e) => {
      const newLang = e.detail;
      if (newLang === 'en' || newLang === 'id') {
        setLang((prev) => (prev === newLang ? prev : newLang));
      }
    };
    window.addEventListener('languageChanged', onHostLangChange);

    // Also pick up storage change in case another tab changes it
    const onStorage = (e) => {
      if (e.key === LANG_KEY && (e.newValue === 'en' || e.newValue === 'id')) {
        setLang(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('languageChanged', onHostLangChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const t = useCallback(
    (key, params) => translate(lang, key, params),
    [lang]
  );

  const changeLang = useCallback((newLang) => {
    if (newLang === 'en' || newLang === 'id') {
      setLang(newLang);
      localStorage.setItem(LANG_KEY, newLang);
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
    }
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, changeLang }}>
      {children}
    </I18nContext.Provider>
  );
};
