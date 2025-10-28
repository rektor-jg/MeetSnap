import React, { useState } from 'react';
import type { Session, AppView, Language, Segment } from '../types';
import { Spinner } from './Spinner';
import { formatTime, formatTimestamp } from '../utils/formatUtils';
import { STRINGS } from '../utils/i18n';
import { ExportButtons } from './ExportButtons';
import { ErrorIcon, CheckCircleIcon, ClockIcon, ProcessingIcon, CalendarIcon, LanguageIcon, ModelIcon } from './icons';

interface SessionViewProps {
  session: Session;
  setView: (view: AppView) => void;
  lang: Language;
  updateSession: (id: string, updates: Partial<Session>) => void;
}

type Tab = 'summary' | 'raw';

const StatusBadge: React.FC<{ status: Session['status'], lang: Language }> = ({ status, lang }) => {
    switch (status) {
        case 'QUEUED':
            return <div className="flex items-center gap-2 text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-500/10 px-3 py-1 rounded-full text-sm font-semibold"><ClockIcon className="w-4 h-4" />{STRINGS[lang].statusQueued}</div>;
        case 'PROCESSING':
            return <div className="flex items-center gap-2 text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 px-3 py-1 rounded-full text-sm font-semibold"><ProcessingIcon className="w-4 h-4 animate-spin" />{STRINGS[lang].statusProcessing}</div>;
        case 'DONE':
            return <div className="flex items-center gap-2 text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-500/10 px-3 py-1 rounded-full text-sm font-semibold"><CheckCircleIcon className="w-4 h-4"/>{STRINGS[lang].statusDone}</div>;
        case 'ERROR':
            return <div className="flex items-center gap-2 text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-500/10 px-3 py-1 rounded-full text-sm font-semibold"><ErrorIcon className="w-4 h-4"/>{STRINGS[lang].statusError}</div>;
    }
}

export const SessionView: React.FC<SessionViewProps> = ({ session, setView, lang, updateSession }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const isProcessing = session.status === 'QUEUED' || session.status === 'PROCESSING';

  const tabClasses = (tabName: Tab) => 
    `px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${
      activeTab === tabName 
        ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-white' 
        : 'text-gray-500 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-white'
    }`;
    
  if (isProcessing) {
    return (
        <div className="text-center p-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30">
            <Spinner className="w-10 h-10 mx-auto mb-4 text-indigo-500 dark:text-indigo-400"/>
            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{STRINGS[lang].statusProcessing}</h3>
            <p className="text-gray-500 dark:text-zinc-400">Your recording is being analyzed. This might take a few moments...</p>
        </div>
    );
  }

  if (session.status === 'ERROR') {
      return (
          <div className="text-center p-10 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl shadow-lg">
              <ErrorIcon className="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400"/>
              <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">{STRINGS[lang].statusError}</h3>
              <p className="text-red-600 dark:text-zinc-300 mb-6">{session.error || STRINGS[lang].errorProcessing}</p>
              <button onClick={() => setView({type: 'home'})} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">
                  {STRINGS[lang].backToHome}
              </button>
          </div>
      )
  }
  
  const modelName = session.aiModel === 'fast' ? STRINGS[lang].modelFast : session.aiModel === 'advanced' ? STRINGS[lang].modelAdvanced : STRINGS[lang].modelPremium;

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30 p-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 dark:border-zinc-800/50 mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">{session.title || STRINGS[lang].sessionViewTitle}</h2>
                <div className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-500 dark:text-zinc-400 text-sm">
                    <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(session.createdAt).toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <LanguageIcon className="w-4 h-4" />
                        <span>{session.language.toUpperCase()}</span>
                    </div>
                    {session.durationSec && (
                        <div className="flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" />
                            <span>{formatTime(session.durationSec)}</span>
                        </div>
                    )}
                    {session.aiModel && (
                        <div className="flex items-center gap-1.5">
                            <ModelIcon className="w-4 h-4" />
                            <span className="font-medium text-gray-700 dark:text-zinc-300">{modelName}</span>
                        </div>
                    )}
                </div>
            </div>
            <StatusBadge status={session.status} lang={lang}/>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-zinc-800/50 rounded-lg border border-gray-300/70 dark:border-zinc-700/50">
                <button onClick={() => setActiveTab('summary')} className={tabClasses('summary')}>{STRINGS[lang].summaryTab}</button>
                <button onClick={() => setActiveTab('raw')} className={tabClasses('raw')}>{STRINGS[lang].rawTab}</button>
            </div>
            <ExportButtons sessionId={session.id} session={session} lang={lang} />
        </div>
        
        <div className="bg-white dark:bg-black/20 p-6 rounded-lg min-h-[300px] border border-gray-200 dark:border-zinc-800/50">
            {activeTab === 'summary' && (
                <div className="prose dark:prose-invert max-w-none prose-p:text-gray-600 dark:prose-p:text-zinc-300 prose-headings:text-gray-900 dark:prose-headings:text-white prose-blockquote:text-gray-500 dark:prose-blockquote:text-zinc-400">
                    {session.artifacts?.summaryMd ? 
                        <div dangerouslySetInnerHTML={{ __html: session.artifacts.summaryMd.replace(/\n/g, '<br />') }}/> :
                        <p className="text-gray-500 dark:text-zinc-500 italic">{STRINGS[lang].noSummary}</p>
                    }
                </div>
            )}
            {activeTab === 'raw' && (
                <div>
                    {session.artifacts?.rawTranscript ? 
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                            {session.artifacts.rawTranscript}
                        </pre> :
                        <p className="text-gray-500 dark:text-zinc-500 italic">{STRINGS[lang].noTranscription}</p>
                    }
                </div>
            )}
        </div>
    </div>
  );
};