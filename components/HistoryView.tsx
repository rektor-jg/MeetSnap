import React from 'react';
import type { Session, AppView, Language } from '../types';
import { formatTime } from '../utils/formatUtils';
import { STRINGS } from '../utils/i18n';
import { MeetsnapLogo } from './icons';
import { StatusDisplay } from './StatusDisplay';

interface HistoryViewProps {
  sessions: Session[];
  setView: (view: AppView) => void;
  lang: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, setView, lang }) => {
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
    <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30 overflow-hidden">
        <h2 className="text-2xl font-bold p-6 text-black dark:text-white">{STRINGS[lang].history}</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="border-b border-gray-200 dark:border-zinc-800/50 bg-gray-100/50 dark:bg-transparent">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{STRINGS[lang].sessionHeaderStatus}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{STRINGS[lang].sessionHeaderTitle}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{STRINGS[lang].sessionHeaderDate}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{STRINGS[lang].sessionHeaderModel}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{STRINGS[lang].sessionHeaderDuration}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">{STRINGS[lang].sessionHeaderLanguage}</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/50">
                    {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-100/70 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusDisplay status={session.status} lang={lang} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">{session.title || '---'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{new Date(session.createdAt).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400 capitalize">{session.aiModel}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{session.durationSec ? formatTime(session.durationSec) : '---'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{session.language.toUpperCase()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => setView({ type: 'session', sessionId: session.id })}
                                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
                                >
                                    {STRINGS[lang].open}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};