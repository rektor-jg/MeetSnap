import React, { useState, useMemo, useCallback } from 'react';
import type { AppView, Session } from './types';
import { HomeView } from './components/HomeView';
import { SessionView } from './components/SessionView';
import { HistoryView } from './components/HistoryView';
import { AdminView } from './components/AdminView';
import { useSessions } from './hooks/useSessions';
import { EasterEgg } from './components/EasterEgg';
import { Layout } from './components/Layout';
import { SettingsProvider } from './context/SettingsContext';
import { useMatrixEasterEgg } from './hooks/useMatrixEasterEgg';
import { useAdminEasterEgg } from './hooks/useAdminEasterEgg';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CookiePolicy } from './components/CookiePolicy';

const AppContent: React.FC = () => {
  const [view, setView] = useState<AppView>({ type: 'home' });
  const { 
    sessions, 
    updateSession, 
    deleteSession, 
    togglePinSession, 
    createAndProcessSession,
    deleteAllSessions,
    reprocessSession,
    importSessions
  } = useSessions();
  
  const { isEasterEggActive, isMatrixTheme, activateMatrixTheme, handleThemeToggle } = useMatrixEasterEgg();
  const { isAdminUnlocked, handleAdminUnlockClick } = useAdminEasterEgg();
  
  const handleDeleteSession = useCallback((id: string) => {
    deleteSession(id);
    if (view.type === 'session' && view.sessionId === id) {
        setView({type: 'home'});
    }
  }, [deleteSession, view]);

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
        return <SessionView session={session} setView={setView} updateSession={updateSession} />;
      case 'history':
        return <HistoryView sessions={sortedSessions} setView={setView} deleteSession={handleDeleteSession} togglePinSession={togglePinSession} />;
      case 'admin':
        return <AdminView 
                  sessions={sortedSessions} 
                  setView={setView}
                  deleteSession={handleDeleteSession}
                  reprocessSession={reprocessSession}
                  deleteAllSessions={deleteAllSessions}
                  importSessions={importSessions}
                />;
      case 'privacy':
        return <PrivacyPolicy setView={setView} />;
      case 'terms':
        return <TermsOfService setView={setView} />;
      case 'cookies':
        return <CookiePolicy setView={setView} />;
      default:
        return <HomeView onSubmit={createAndProcessSession} setView={setView} sessions={sortedSessions.slice(0, 3)} />;
    }
  };

  return (
    <>
      <Layout 
        setView={setView} 
        onThemeToggle={handleThemeToggle} 
        isMatrix={isMatrixTheme}
        onAdminUnlockClick={handleAdminUnlockClick}
        isAdminUnlocked={isAdminUnlocked}
      >
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