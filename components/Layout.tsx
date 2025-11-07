import React from 'react';
import type { AppView } from '../types';
import { MeetsnapLogo } from './icons';
import { STRINGS } from '../utils/i18n';
import { ThemeToggle } from './ThemeToggle';
import { useSettings } from '../context/SettingsContext';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  setView: (view: AppView) => void;
  onThemeToggle: () => void;
  isMatrix: boolean;
  onAdminUnlockClick: () => void;
  isAdminUnlocked: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, setView, onThemeToggle, isMatrix, onAdminUnlockClick, isAdminUnlocked }) => {
  const { theme, lang, setLang } = useSettings();

  const mainContent = (
    <div className="w-full max-w-3xl flex-grow">
      {children}
    </div>
  );

  const layoutClasses = `min-h-screen text-gray-900 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300 bg-white dark:bg-black`;

  if (isMatrix) {
    return (
      <div className="min-h-screen text-gray-900 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
        {mainContent}
      </div>
    );
  }

  return (
    <div className={layoutClasses}>
      <div className="w-full max-w-3xl flex flex-col flex-grow">
        <header className="flex items-center justify-between mb-10 w-full gap-2">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                onAdminUnlockClick();
                setView({type: 'home'});
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setView({type: 'home'}); }}
            >
                <div className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-white/20 transition-colors">
                    <MeetsnapLogo className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 hidden sm:block">
                    {STRINGS[lang].appName}
                </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                {isAdminUnlocked && (
                    <button onClick={() => setView({type: 'admin'})} className="text-sm font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">Admin</button>
                )}
                <button onClick={() => setView({type: 'history'})} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{STRINGS[lang].history}</button>
                 <div className="flex items-center gap-1 text-sm p-1 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <button onClick={() => setLang('en')} className={`px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300 transition-colors ${lang === 'en' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>EN</button>
                    <button onClick={() => setLang('pl')} className={`px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300 transition-colors ${lang === 'pl' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>PL</button>
                 </div>
                 <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            </div>
        </header>

        {mainContent}
        
        <Footer setView={setView} />
      </div>
    </div>
  );
};