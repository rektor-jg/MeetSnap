import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { useSettings } from '../context/SettingsContext';

export const BackgroundSelector: React.FC = () => {
    const settings = useSettings();
    if (!settings) return null; // Should not happen within Provider
    const { lang, isBackgroundFeatureEnabled, setIsBackgroundFeatureEnabled, backgroundIndex, setBackgroundIndex } = settings;
    
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const backgrounds = [
        { name: STRINGS[lang].bgStyle1Name, class: 'bg-style-1' },
        { name: STRINGS[lang].bgStyle2Name, class: 'bg-style-2' },
        { name: STRINGS[lang].bgStyle3Name, class: 'bg-style-3' },
        { name: STRINGS[lang].bgStyle4Name, class: 'bg-style-4' },
        { name: STRINGS[lang].bgStyle5Name, class: 'bg-style-5' },
    ];
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectBackground = (index: number) => {
        setBackgroundIndex(index);
        if (!isBackgroundFeatureEnabled) {
            setIsBackgroundFeatureEnabled(true);
        }
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black ${isBackgroundFeatureEnabled ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'}`}
                aria-label={STRINGS[lang].toggleDynamicBackground}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <PhotoIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                 <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md ring-1 ring-black ring-opacity-5 dark:ring-zinc-700/50 focus:outline-none z-10" role="menu">
                     <div className="p-2">
                        <div className="flex items-center justify-between px-2 py-2">
                            <label htmlFor="bg-toggle" className="text-sm font-medium text-gray-800 dark:text-zinc-200">{STRINGS[lang].toggleDynamicBackground}</label>
                            <button
                                id="bg-toggle"
                                role="switch"
                                aria-checked={isBackgroundFeatureEnabled}
                                onClick={() => setIsBackgroundFeatureEnabled(!isBackgroundFeatureEnabled)}
                                className={`${isBackgroundFeatureEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-zinc-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            >
                                <span className={`${isBackgroundFeatureEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                            </button>
                        </div>
                        <div className="border-t border-gray-200 dark:border-zinc-700/50 my-2" />
                        <div className="grid grid-cols-1 gap-1">
                            {backgrounds.map((bg, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectBackground(index)}
                                    className={`w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-colors
                                        ${backgroundIndex === index && isBackgroundFeatureEnabled ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'hover:bg-gray-100 dark:hover:bg-zinc-700/50'}`
                                    }
                                    role="menuitem"
                                >
                                    <div className={`w-8 h-6 rounded-md border border-gray-300 dark:border-zinc-600 flex-shrink-0 ${bg.class}`} />
                                    <span className="text-gray-800 dark:text-zinc-200">{bg.name}</span>
                                </button>
                            ))}
                        </div>
                     </div>
                 </div>
            )}
        </div>
    );
};