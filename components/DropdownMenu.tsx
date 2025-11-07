import React, { useState, useRef, useEffect } from 'react';
import { EllipsisVerticalIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { useSettings } from '../context/SettingsContext';

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isDestructive?: boolean;
}

interface DropdownMenuProps {
    items: MenuItem[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
    const { lang } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    const handleItemClick = (e: React.MouseEvent, onClick: () => void) => {
        e.stopPropagation();
        onClick();
        setIsOpen(false);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    onClick={handleToggle}
                    className="flex items-center rounded-full p-2 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-label={STRINGS[lang].actions}
                >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
            </div>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 dark:ring-zinc-700 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={(e) => handleItemClick(e, item.onClick)}
                                className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition-colors
                                ${item.isDestructive
                                    ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                                    : 'text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700'
                                }`}
                                role="menuitem"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};