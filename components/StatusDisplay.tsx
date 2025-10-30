import React, { useContext } from 'react';
import type { Session } from '../types';
import { STRINGS } from '../utils/i18n';
import { CheckCircleIcon, ClockIcon, ErrorIcon, ProcessingIcon } from './icons';
import { SettingsContext } from '../context/SettingsContext';

interface StatusDisplayProps {
    status: Session['status'];
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
    const { lang } = useContext(SettingsContext);
    switch(status) {
        case 'DONE': 
            return <div className="flex items-center gap-2 text-sm"><CheckCircleIcon className="w-5 h-5 text-green-500" /> <span className="text-gray-600 dark:text-zinc-300">{STRINGS[lang].statusDone}</span></div>;
        case 'PROCESSING': 
            return <div className="flex items-center gap-2 text-sm"><ProcessingIcon className="w-5 h-5 text-blue-500 animate-spin" /> <span className="text-gray-600 dark:text-zinc-300">{STRINGS[lang].statusProcessing}</span></div>;
        case 'QUEUED': 
            return <div className="flex items-center gap-2 text-sm"><ClockIcon className="w-5 h-5 text-yellow-500" /> <span className="text-gray-600 dark:text-zinc-300">{STRINGS[lang].statusQueued}</span></div>;
        case 'ERROR': 
            return <div className="flex items-center gap-2 text-sm"><ErrorIcon className="w-5 h-5 text-red-500" /> <span className="text-gray-600 dark:text-zinc-300">{STRINGS[lang].statusError}</span></div>;
        default: 
            return null;
    }
};