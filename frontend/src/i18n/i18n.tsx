import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { translations, languages, Language } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: typeof languages;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [language, setLanguageState] = useState<Language>(() => {
    // Charger depuis localStorage ou préférences utilisateur
    const stored = localStorage.getItem('language') as Language;
    if (stored && languages.some(l => l.code === stored)) {
      return stored;
    }
    // Utiliser la préférence de l'utilisateur si disponible
    if (user?.preferences?.language) {
      return user.preferences.language as Language;
    }
    // Détecter la langue du navigateur
    const browserLang = navigator.language.split('-')[0] as Language;
    if (languages.some(l => l.code === browserLang)) {
      return browserLang;
    }
    // Par défaut: anglais
    return 'en';
  });

  // Synchroniser avec les préférences utilisateur
  useEffect(() => {
    if (user?.preferences?.language) {
      setLanguageState(user.preferences.language as Language);
      localStorage.setItem('language', user.preferences.language);
    }
  }, [user?.preferences?.language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages: languages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}







