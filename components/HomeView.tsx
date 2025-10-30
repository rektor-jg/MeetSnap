import React, { useState, useContext } from 'react';
import type { AppView, Session, Language, AiModel } from '../types';
import { RecordPanel } from './RecordPanel';
import { UploadPanel } from './UploadPanel';
import { STRINGS } from '../utils/i18n';
import { StatusDisplay } from './StatusDisplay';
import { SettingsContext } from '../context/SettingsContext';

interface HomeViewProps {
  onSubmit: (params: { blob: Blob, language: Language, doSummary: boolean, aiModel: AiModel }) => Promise<Session>;
  setView: (view: AppView) => void;
  sessions: Session[];
}

type Tab = 'record' | 'upload';

export const HomeView: React.FC<HomeViewProps> = ({ onSubmit, setView, sessions }) => {
  const [activeTab, setActiveTab] = useState<Tab>('record');
  const { lang } = useContext(SettingsContext);

  const handleProcessRequest = async (blob: Blob, language: Language, doSummary: boolean, aiModel: AiModel) => {
    const newSession = await onSubmit({ blob, language, doSummary, aiModel });
    setView({ type: 'session', sessionId: newSession.id });
  };

  const tabClasses = (tabName: Tab) => 
    `w-full py-2.5 text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${
      activeTab === tabName 
        ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-white shadow' 
        : 'text-gray-500 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200'
    }`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 mb-2">{STRINGS[lang].appHeadline}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
          {STRINGS[lang].appSubhead}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30 overflow-hidden">
        <div className="p-2 bg-gray-100 dark:bg-zinc-900/70 border-b border-gray-200 dark:border-zinc-800/50">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/50 dark:bg-black/20 rounded-lg">
                <button onClick={() => setActiveTab('record')} className={tabClasses('record')}>
                    {STRINGS[lang].record}
                </button>
                <button onClick={() => setActiveTab('upload')} className={tabClasses('upload')}>
                    {STRINGS[lang].uploadFile}
                </button>
            </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'record' ? (
            <RecordPanel onSubmit={handleProcessRequest} />
          ) : (
            <UploadPanel onSubmit={handleProcessRequest} />
          )}
        </div>
      </div>

      {sessions.length > 0 && (
          <div className="mt-12">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-black dark:text-white">{STRINGS[lang].recentActivity}</h3>
                  <button onClick={() => setView({type: 'history'})} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                      {STRINGS[lang].viewAll}
                  </button>
              </div>
              <div className="space-y-3">
                  {sessions.map(session => (
                      <button 
                        key={session.id} 
                        onClick={() => setView({type: 'session', sessionId: session.id})}
                        className="w-full text-left bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 p-4 rounded-xl flex justify-between items-center hover:bg-gray-100 dark:hover:bg-zinc-800/70 hover:border-gray-300 dark:hover:border-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
                      >
                          <div className="min-w-0">
                              <p className="font-semibold text-gray-800 dark:text-white truncate">{session.title || 'Untitled Session'}</p>
                              <p className="text-sm text-gray-500 dark:text-zinc-400">{new Date(session.createdAt).toLocaleDateString(lang, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <StatusDisplay status={session.status} />
                          </div>
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};