import React, { useContext } from 'react';
import type { Session } from '../types';
import { formatTime } from '../utils/formatUtils';
import { STRINGS } from '../utils/i18n';
import { ClockIcon, LanguageIcon, ModelIcon, TrashIcon, StarIcon } from './icons';
import { StatusDisplay } from './StatusDisplay';
import { DropdownMenu } from './DropdownMenu';
import { SettingsContext } from '../context/SettingsContext';

interface SessionCardProps {
    session: Session;
    onClick: () => void;
    onDelete: () => void;
    onTogglePin: () => void;
}

const InfoPill: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
        {icon}
        <span className="text-xs font-medium text-gray-600 dark:text-zinc-300">{label}</span>
    </div>
);

export const SessionCard: React.FC<SessionCardProps> = ({ session, onClick, onDelete, onTogglePin }) => {
    const { lang } = useContext(SettingsContext);
    const modelName = session.aiModel === 'fast' ? STRINGS[lang].modelFast : session.aiModel === 'advanced' ? STRINGS[lang].modelAdvanced : STRINGS[lang].modelPremium;

    const menuItems = [
        {
            label: session.isPinned ? STRINGS[lang].unpinSession : STRINGS[lang].pinSession,
            icon: <StarIcon className="w-4 h-4" />,
            onClick: onTogglePin,
        },
        {
            label: STRINGS[lang].deleteSession,
            icon: <TrashIcon className="w-4 h-4" />,
            onClick: onDelete,
            isDestructive: true,
        }
    ];
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.target !== e.currentTarget) {
            return;
        }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };
    
    return (
        <div
            onClick={onClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Open session: ${session.title || 'Untitled Session'}`}
            className="group w-full text-left bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 p-4 rounded-xl transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700/80 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900 cursor-pointer"
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    {session.isPinned && (
                        <StarIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" title={STRINGS[lang].pinSession} />
                    )}
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 dark:text-white truncate">
                            {session.title || 'Untitled Session'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                            {new Date(session.createdAt).toLocaleDateString(lang, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 z-10 self-end sm:self-auto">
                    <StatusDisplay status={session.status} />
                    <DropdownMenu items={menuItems} />
                </div>
            </div>
            
            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/70 flex items-center justify-between">
                <div className="flex items-center flex-wrap gap-3">
                    {session.durationSec && <InfoPill icon={<ClockIcon className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400"/>} label={formatTime(session.durationSec)} />}
                    <InfoPill icon={<LanguageIcon className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400"/>} label={session.language.toUpperCase()} />
                    <InfoPill icon={<ModelIcon className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400"/>} label={modelName} />
                </div>
            </div>
        </div>
    );
};