import React, { useState, useContext } from 'react';
import type { Session, AppView } from '../types';
import { formatTime } from '../utils/formatUtils';
import { STRINGS } from '../utils/i18n';
import { ExportButtons } from './ExportButtons';
import { ErrorIcon, CheckCircleIcon, ClockIcon, ProcessingIcon, CalendarIcon, LanguageIcon, ModelIcon, DownloadIcon, ChevronLeftIcon, NotionIcon } from './icons';
import { ProcessingView } from './ProcessingView';
import { CopyButton } from './CopyButton';
import { SettingsContext } from '../context/SettingsContext';
import { EditableTitle } from './EditableTitle';
import { formatForNotion } from '../services/geminiService';
import { Spinner } from './Spinner';

interface SessionViewProps {
  session: Session;
  setView: (view: AppView) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
}

type Tab = 'summary' | 'raw';

const StatusBadge: React.FC<{ status: Session['status'] }> = ({ status }) => {
    const { lang } = useContext(SettingsContext);
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

export const SessionView: React.FC<SessionViewProps> = ({ session, setView, updateSession }) => {
  const { lang } = useContext(SettingsContext);
  const [activeTab, setActiveTab] = useState<Tab>(session.doSummary ? 'summary' : 'raw');
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);

  const handleTitleSave = (newTitle: string) => {
    if (newTitle && newTitle !== session.title) {
        updateSession(session.id, { title: newTitle });
    }
  };
  
  const handleFormatForNotion = async () => {
    if (!session.artifacts?.rawTranscript) return;
    setIsFormatting(true);
    setFormatError(null);
    try {
        const formattedSummary = await formatForNotion(session.artifacts.rawTranscript, session.aiModel);
        updateSession(session.id, {
            artifacts: {
                ...session.artifacts,
                summaryMd: formattedSummary,
            },
        });
        setActiveTab('summary');
    } catch (error) {
        console.error("Failed to format for Notion:", error);
        setFormatError(STRINGS[lang].formatError);
    } finally {
        setIsFormatting(false);
    }
  };

  const isProcessing = session.status === 'QUEUED' || session.status === 'PROCESSING';

  const tabClasses = (tabName: Tab) => 
    `px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 ${
      activeTab === tabName 
        ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-white' 
        : 'text-gray-500 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-white'
    }`;
    
  if (isProcessing) {
    return <ProcessingView />;
  }

  if (session.status === 'ERROR') {
      return (
          <div className="text-center p-6 sm:p-10 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl shadow-lg">
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

  const handleDownloadAudio = () => {
    if (session.audioBlob) {
      const url = URL.createObjectURL(session.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.id || 'recording'}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const textToCopy = activeTab === 'summary' 
    ? session.artifacts?.summaryMd || '' 
    : session.artifacts?.rawTranscript || '';

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30 p-4 sm:p-6">
        <header className="pb-4 border-b border-gray-200 dark:border-zinc-800/50 mb-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-y-4 gap-x-6">
                
                 {/* Right side content: Status and Download. Placed first in code for flexbox ordering on mobile. */}
                 <div className="w-full sm:w-auto flex items-center justify-end gap-3 flex-shrink-0 order-1 sm:order-2">
                    <StatusBadge status={session.status}/>
                    {session.audioBlob && (
                        <button 
                            onClick={handleDownloadAudio}
                            className="p-2 text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition-colors rounded-lg border border-gray-300/70 dark:border-zinc-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900"
                            title={STRINGS[lang].downloadAudio}
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Left side content: Back button, Title, Details, Export */}
                <div className="flex items-start gap-3 sm:gap-4 flex-grow min-w-0 order-2 sm:order-1">
                     <button
                        onClick={() => setView({ type: 'history' })}
                        className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900 mt-1 flex-shrink-0"
                        aria-label="Back to history"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-grow min-w-0">
                        <EditableTitle
                            initialTitle={session.title || STRINGS[lang].sessionViewTitle}
                            onSave={handleTitleSave}
                            placeholder={STRINGS[lang].sessionViewTitle}
                        />
                        <div className="flex items-center flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 mt-2 text-gray-500 dark:text-zinc-400 text-sm">
                            <div className="flex items-center gap-1.5" title={new Date(session.createdAt).toLocaleString(lang)}>
                                <CalendarIcon className="w-4 h-4" />
                                <span>{new Date(session.createdAt).toLocaleDateString(lang, { dateStyle: 'medium'})}</span>
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
                        <div className="mt-4">
                            <ExportButtons sessionId={session.id} session={session} activeTab={activeTab} />
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-zinc-800/50 rounded-lg border border-gray-300/70 dark:border-zinc-700/50 self-start">
                {session.doSummary && <button onClick={() => setActiveTab('summary')} className={tabClasses('summary')}>{STRINGS[lang].summaryTab}</button>}
                <button onClick={() => setActiveTab('raw')} className={tabClasses('raw')}>{STRINGS[lang].rawTab}</button>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
                 <button
                    onClick={handleFormatForNotion}
                    disabled={isFormatting || !session.artifacts?.rawTranscript}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isFormatting ? <Spinner className="w-4 h-4" /> : <NotionIcon className="w-4 h-4" />}
                    <span>{isFormatting ? STRINGS[lang].formattingForNotion : STRINGS[lang].formatForNotion}</span>
                </button>
                <CopyButton textToCopy={textToCopy} />
            </div>
        </div>
        
        {formatError && <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">{formatError}</p>}

        <div className="bg-white dark:bg-black/20 p-4 sm:p-6 rounded-lg min-h-[300px] border border-gray-200 dark:border-zinc-800/50">
            {activeTab === 'summary' && session.doSummary && (
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