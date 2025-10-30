import React, { useState, useMemo, useContext } from 'react';
import type { Session, AppView } from '../types';
import { STRINGS } from '../utils/i18n';
import { MeetsnapLogo, ChevronLeftIcon } from './icons';
import { SessionCard } from './SessionCard';
import { SettingsContext } from '../context/SettingsContext';

interface HistoryViewProps {
  sessions: Session[];
  setView: (view: AppView) => void;
  deleteSession: (id: string) => void;
  togglePinSession: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, setView, deleteSession, togglePinSession }) => {
  const { lang } = useContext(SettingsContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredAndSortedSessions = useMemo(() => {
    return sessions
      .filter(session => 
        (session.title || 'untitled').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [sessions, searchTerm, sortOrder]);
  
  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl">
        <MeetsnapLogo className="w-16 h-16 mx-auto text-gray-400 dark:text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white">{STRINGS[lang].noSessions}</h2>
        <button
          onClick={() => setView({ type: 'home' })}
          className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-lg text-sm"
        >
          {STRINGS[lang].record} / {STRINGS[lang].uploadFile}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30">
        <header className="flex items-center gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-800/50">
            <button
                onClick={() => setView({ type: 'home' })}
                className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900"
                aria-label={STRINGS[lang].backToHome}
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-black dark:text-white">{STRINGS[lang].history}</h2>
        </header>

        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-zinc-800/50 flex flex-col sm:flex-row gap-4">
            <input 
                type="text"
                placeholder={STRINGS[lang].searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:flex-grow bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
                <label htmlFor="sort-order" className="text-sm font-medium text-gray-700 dark:text-zinc-300">{STRINGS[lang].sortLabel}:</label>
                <select 
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full sm:w-auto bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                >
                    <option value="newest">{STRINGS[lang].sortNewest}</option>
                    <option value="oldest">{STRINGS[lang].sortOldest}</option>
                </select>
            </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
            {filteredAndSortedSessions.length > 0 ? (
                filteredAndSortedSessions.map((session) => (
                    <SessionCard 
                        key={session.id} 
                        session={session}
                        onClick={() => setView({ type: 'session', sessionId: session.id })}
                        onDelete={() => {
                            if (window.confirm(STRINGS[lang].deleteSessionConfirmMessage)) {
                                deleteSession(session.id);
                            }
                        }}
                        onTogglePin={() => togglePinSession(session.id)}
                    />
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-zinc-400">{STRINGS[lang].noResults}</p>
                </div>
            )}
        </div>
    </div>
  );
};