import React, { useContext } from 'react';
import type { Session } from '../types';
import { exportToMarkdown, exportToSRT, exportToTXT, exportToVTT } from '../utils/exportUtils';
import { STRINGS } from '../utils/i18n';
import { SettingsContext } from '../context/SettingsContext';

interface ExportButtonsProps {
  sessionId: string;
  session: Session;
  activeTab: 'summary' | 'raw';
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ sessionId, session, activeTab }) => {
  const { lang } = useContext(SettingsContext);

  const handleExport = (format: 'md' | 'srt' | 'vtt' | 'txt') => {
    switch (format) {
      case 'md':
        exportToMarkdown(session, lang, activeTab);
        break;
      case 'srt':
        exportToSRT(session);
        break;
      case 'vtt':
        exportToVTT(session);
        break;
      case 'txt':
        exportToTXT(session, activeTab);
        break;
    }
  };

  const buttonClass = "px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900";

  return (
    <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-sm font-semibold text-gray-500 dark:text-zinc-400 mr-2">{STRINGS[lang].export}:</span>
        <div className="flex items-center rounded-lg border border-gray-300/70 dark:border-zinc-700/50 overflow-hidden">
            <button onClick={() => handleExport('md')} className={`${buttonClass} border-r border-gray-300/70 dark:border-zinc-700/50`}>MD</button>
            <button onClick={() => handleExport('srt')} className={`${buttonClass} border-r border-gray-300/70 dark:border-zinc-700/50`}>SRT</button>
            <button onClick={() => handleExport('vtt')} className={`${buttonClass} border-r border-gray-300/70 dark:border-zinc-700/50`}>VTT</button>
            <button onClick={() => handleExport('txt')} className={buttonClass}>TXT</button>
        </div>
    </div>
  );
};