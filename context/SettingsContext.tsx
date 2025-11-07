import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { Language } from '../types';

type Theme = 'light' | 'dark';

interface SettingsContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, defaultValue: T, validator?: (value: any) => value is T): T => {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const storedValue = window.localStorage.getItem(key);
            if (storedValue !== null) {
                const parsedValue = JSON.parse(storedValue);
                if (validator ? validator(parsedValue) : true) {
                    return parsedValue;
                }
            }
        } catch (e) {
            console.error(`Failed to parse ${key} from localStorage`, e);
        }
    }
    return defaultValue;
};

const getInitialTheme = (): Theme => {
    // Always default to 'light' unless a theme is explicitly saved in localStorage.
    // This removes the check for the system's preferred color scheme.
    return getInitialState<'light' | 'dark'>('theme', 'light', (v): v is Theme => v === 'light' || v === 'dark');
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => getInitialState<Language>('lang', 'en', (v): v is Language => ['en', 'pl', 'auto'].includes(v)));
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', JSON.stringify(lang));
  }, [lang]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    lang,
    setLang,
  }), [theme, lang]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};