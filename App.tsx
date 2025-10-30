import React, { useState, useMemo } from 'react';
import type { AppView, Session } from './types';
import { HomeView } from './components/HomeView';
import { SessionView } from './components/SessionView';
import { HistoryView } from './components/HistoryView';
import { useSessions } from './hooks/useSessions';
import { EasterEgg } from './components/EasterEgg';
import { Layout } from './components/Layout';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useMatrixEasterEgg } from './hooks/useMatrixEasterEgg';

const AppContent: React.FC = () => {
  const [view, setView] = useState<AppView>({ type: 'home' });
  const { 
    sessions, 
    updateSession, 
    deleteSession, 
    togglePinSession, 
    createAndProcessSession 
  } = useSessions();
  const { lang } = useSettings();

  const { isEasterEggActive, isMatrixTheme, activateMatrixTheme, handleThemeToggle } = useMatrixEasterEgg();
  
  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (view.type === 'session' && view.sessionId === id) {
        setView({type: 'home'});
    }
  };

  const sortedSessions = useMemo(() => {
    return Object.values(sessions).sort((a: Session, b: Session) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    });
  }, [sessions]);

  const renderView = () => {
    switch (view.type) {
      case 'home':
        return <HomeView onSubmit={createAndProcessSession} setView={setView} sessions={sortedSessions.slice(0, 3)} />;
      case 'session':
        const session = sessions[view.sessionId];
        if (!session) {
            setTimeout(() => setView({ type: 'home' }), 0);
            return null;
        }
        return <SessionView session={session} setView={setView} updateSession={updateSession} />;
      case 'history':
        return <HistoryView sessions={sortedSessions} setView={setView} deleteSession={handleDeleteSession} togglePinSession={togglePinSession} />;
      default:
        return <HomeView onSubmit={createAndProcessSession} setView={setView} sessions={sortedSessions.slice(0, 3)} />;
    }
  };

  return (
    <>
      <Layout setView={setView} onThemeToggle={handleThemeToggle} isMatrix={isMatrixTheme}>
        <main className="w-full">
            {renderView()}
        </main>
      </Layout>
      {isEasterEggActive && <EasterEgg onActivate={activateMatrixTheme} />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;