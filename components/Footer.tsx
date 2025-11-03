import React, { useContext } from 'react';
import type { AppView } from '../types';
import { STRINGS } from '../utils/i18n';
import { SettingsContext } from '../context/SettingsContext';

interface FooterProps {
    setView: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
    const { lang } = useContext(SettingsContext);
    
    const linkClasses = "text-xs text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:underline transition-colors";

    return (
        <footer className="w-full mt-12 pt-6 border-t border-gray-200 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 dark:text-zinc-500">
                &copy; {new Date().getFullYear()} meetsnap. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
                <button onClick={() => setView({type: 'terms'})} className={linkClasses}>{STRINGS[lang].termsOfService}</button>
                <button onClick={() => setView({type: 'privacy'})} className={linkClasses}>{STRINGS[lang].privacyPolicy}</button>
                <button onClick={() => setView({type: 'cookies'})} className={linkClasses}>{STRINGS[lang].cookiePolicy}</button>
            </div>
        </footer>
    );
};