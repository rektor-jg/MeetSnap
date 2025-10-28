import React, { useState, useCallback, useEffect } from 'react';
import type { Session, AppView, Language, AiModel } from './types';
import { HomeView } from './components/HomeView';
import { SessionView } from './components/SessionView';
import { HistoryView } from './components/HistoryView';
import { processAudioFile } from './services/geminiService';
import { MeetsnapLogo } from './components/icons';
import { STRINGS } from './utils/i18n';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>({ type: 'home' });
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions(prev => {
      const existingSession = prev[id] || {};
      return {
        ...prev,
        [id]: { 
          ...existingSession, 
          ...updates,
          // Deep merge artifacts to prevent overwriting nested properties
          artifacts: {
            ...(existingSession.artifacts || {}),
            ...(updates.artifacts || {}),
          }
        },
      };
    });
  }, []);


  const handleProcessRequest = async (blob: Blob, language: Language, doSummary: boolean, aiModel: AiModel) => {
    const sessionId = `sid_${Date.now()}`;
    const newSession: Session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      language,
      status: 'QUEUED',
      doSummary: doSummary,
      audioBlob: blob,
      aiModel: aiModel,
    };
    
    setSessions(prev => ({ ...prev, [sessionId]: newSession }));
    setView({ type: 'session', sessionId });

    try {
      await processAudioFile(newSession, (updates) => updateSession(sessionId, updates));
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      updateSession(sessionId, { status: 'ERROR', error: errorMessage });
    }
  };
  
  const sortedSessions = Object.values(sessions).sort((a: Session, b: Session) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const renderView = () => {
    switch (view.type) {
      case 'home':
        return <HomeView onSubmit={handleProcessRequest} setView={setView} lang={currentLang} sessions={sortedSessions.slice(0, 3)} />;
      case 'session':
        const session = sessions[view.sessionId];
        return session ? <SessionView session={session} setView={setView} lang={currentLang} updateSession={updateSession} /> : <HomeView onSubmit={handleProcessRequest} setView={setView} lang={currentLang} sessions={sortedSessions.slice(0, 3)} />;
      case 'history':
        return <HistoryView sessions={sortedSessions} setView={setView} lang={currentLang}/>;
      default:
        return <HomeView onSubmit={handleProcessRequest} setView={setView} lang={currentLang} sessions={sortedSessions.slice(0, 3)} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <div className="w-full max-w-3xl">
        <header className="flex items-center justify-between mb-10 w-full">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setView({type: 'home'})}
            >
                <div className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-white/20 transition-colors">
                    <MeetsnapLogo className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {STRINGS[currentLang].appName}
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setView({type: 'history'})} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{STRINGS[currentLang].history}</button>
                 <div className="flex items-center gap-1 text-sm p-1 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg">
                    <button onClick={() => setCurrentLang('pl')} className={`px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300 transition-colors ${currentLang === 'pl' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>PL</button>
                    <button onClick={() => setCurrentLang('en')} className={`px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300 transition-colors ${currentLang === 'en' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>EN</button>
                 </div>
                 <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
        </header>

        <main className="w-full">
            {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;