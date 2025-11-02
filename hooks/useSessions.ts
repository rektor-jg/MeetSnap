import { useReducer, useEffect, useCallback } from 'react';
import type { Session, Language, AiModel } from '../types';
import { processAudioFile } from '../services/geminiService';

// Define action types for the reducer
type Action =
  | { type: 'SET_SESSIONS'; payload: Record<string, Session> }
  | { type: 'ADD_OR_UPDATE'; payload: Session }
  | { type: 'DELETE'; payload: string }
  | { type: 'TOGGLE_PIN'; payload: string }
  | { type: 'DELETE_ALL' };

// Reducer function to manage session state
const sessionsReducer = (state: Record<string, Session>, action: Action): Record<string, Session> => {
  switch (action.type) {
    case 'SET_SESSIONS':
      return action.payload;
    case 'ADD_OR_UPDATE':
      return {
        ...state,
        [action.payload.id]: {
          ...(state[action.payload.id] || {}),
          ...action.payload,
          // Deep merge artifacts to prevent overwriting nested properties
          artifacts: {
            ...(state[action.payload.id]?.artifacts || {}),
            ...(action.payload.artifacts || {}),
          }
        },
      };
    case 'DELETE': {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case 'TOGGLE_PIN': {
        if (!state[action.payload]) return state;
        const session = state[action.payload];
        return {
            ...state,
            [action.payload]: { ...session, isPinned: !session.isPinned },
        };
    }
    case 'DELETE_ALL': {
        return {};
    }
    default:
      return state;
  }
};

// Helper to prepare sessions for storage by removing non-serializable parts like Blobs
const prepareSessionsForStorage = (sessions: Record<string, Session>): Record<string, Omit<Session, 'audioBlob'>> => {
  const savableSessions: Record<string, Omit<Session, 'audioBlob'>> = {};
  for (const id in sessions) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { audioBlob, ...rest } = sessions[id];
    savableSessions[id] = rest;
  }
  return savableSessions;
};

const getInitialState = (): Record<string, Session> => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {};
    }
    try {
        const storedSessions = window.localStorage.getItem('sessions');
        if (storedSessions) {
            const parsedSessions = JSON.parse(storedSessions);
            if (Object.keys(parsedSessions).length > 0) {
                return parsedSessions;
            }
        }
    } catch (e) {
        console.error("Failed to load sessions from localStorage", e);
    }
    
    // If storage is empty, create and return sample sessions for demo purposes.
    const sampleSessionId1 = 'sid_example_1';
    const sampleSession1: Session = {
      id: sampleSessionId1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      language: 'en',
      status: 'DONE',
      doSummary: true,
      aiModel: 'advanced',
      title: 'Project Phoenix - Q3 Planning Session',
      durationSec: 53,
      isPinned: true,
      artifacts: {
        rawTranscript: "Speaker 1: Alright team, let's kick off the Q3 planning for Project Phoenix. Where are we with the initial prototype?\nSpeaker 2: We've completed the backend architecture. The API endpoints are stable and documented. The frontend team is slightly behind, but they're confident they can catch up by next week.\nSpeaker 1: Good to hear. What are the main roadblocks for the frontend?\nSpeaker 3: We had some issues with the new UI library, but we've sorted them out. The main challenge now is integrating the real-time data visualization component. It's more complex than we initially anticipated.\nSpeaker 1: Okay, let's allocate some extra resources there. Can we get a demo by the end of the month?\nSpeaker 3: That's a tight deadline, but doable. We'll prioritize it.\nSpeaker 2: On the backend, we need to finalize the deployment strategy. I'm proposing we use a serverless architecture to manage costs and scalability.\nSpeaker 1: Sounds promising. Draft a proposal with the cost-benefit analysis and we'll review it on Friday. Great work everyone, let's keep the momentum going.",
        summaryMd: "### TL;DR\n\nThe team discussed the Q3 plan for Project Phoenix. The backend prototype is complete and stable. The frontend team is slightly behind due to UI library issues but expects to catch up. The main frontend challenge is a complex data visualization component.\n\n### Action Items\n\n- **Frontend Team:** Prioritize and deliver a demo of the data visualization component by the end of the month.\n- **Backend Team:** Draft a proposal for a serverless deployment strategy, including a cost-benefit analysis, for review on Friday.",
        segments: [
            { start: 0, end: 4, text: "Speaker 1: Alright team, let's kick off the Q3 planning for Project Phoenix." },
            { start: 4, end: 7, text: "Where are we with the initial prototype?" },
            { start: 8, end: 13, text: "Speaker 2: We've completed the backend architecture. The API endpoints are stable and documented." },
            { start: 13, end: 17, text: "The frontend team is slightly behind, but they're confident they can catch up by next week." },
            { start: 18, end: 21, text: "Speaker 1: Good to hear. What are the main roadblocks for the frontend?" },
            { start: 22, end: 30, text: "Speaker 3: We had some issues with the new UI library, but we've sorted them out. The main challenge now is integrating the real-time data visualization component." },
            { start: 30, end: 33, text: "It's more complex than we initially anticipated." },
            { start: 34, end: 38, text: "Speaker 1: Okay, let's allocate some extra resources there. Can we get a demo by the end of the month?" },
            { start: 38, end: 41, text: "Speaker 3: That's a tight deadline, but doable. We'll prioritize it." },
            { start: 42, end: 48, text: "Speaker 2: On the backend, we need to finalize the deployment strategy. I'm proposing we use a serverless architecture to manage costs and scalability." },
            { start: 48, end: 53, text: "Speaker 1: Sounds promising. Draft a proposal with the cost-benefit analysis and we'll review it on Friday. Great work everyone, let's keep the momentum going." }
        ]
      }
    };
    const sampleSessionId2 = 'sid_example_2';
    const sampleSession2: Session = {
        id: sampleSessionId2,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        language: 'pl',
        status: 'DONE',
        doSummary: true,
        aiModel: 'fast',
        title: 'Burza Mózgów: Kampania Letnia',
        durationSec: 45,
        artifacts: {
          rawTranscript: "Mówca 1: Cześć wszystkim. Zaczynamy naszą burzę mózgów na temat kampanii letniej. Ania, jakie masz pierwsze pomysły?\nMówca 2: Myślałam o motywie 'Miejskie Odkrycia'. Skupilibyśmy się na lokalnych atrakcjach i promowali je przez social media, głównie Instagram i TikTok.\nMówca 1: Podoba mi się. To wpisuje się w trend 'slow travel'. A co z grupą docelową?\nMówca 2: Głównie ludzie w wieku 20-35 lat, aktywni, szukający nietypowych sposobów na spędzenie lata w mieście.\nMówca 3: Możemy dodać element grywalizacji. Na przykład konkurs na najlepsze zdjęcie z 'miejskiej wyprawy' z naszym produktem.\nMówca 1: Świetny pomysł, Piotrze. To zwiększy zaangażowanie. Przygotujcie proszę zarys tej koncepcji na środę. Dziękuję.",
          summaryMd: "### TL;DR\n\nZespół omówił koncepcję letniej kampanii marketingowej 'Miejskie Odkrycia', skierowanej do osób w wieku 20-35 lat. Kampania ma promować lokalne atrakcje za pośrednictwem mediów społecznościowych i zawierać element grywalizacji.\n\n### Zadania do wykonania\n\n- **Ania i Piotr:** Przygotować szczegółowy zarys koncepcji kampanii 'Miejskie Odkrycia' wraz z elementem grywalizacji na najbliższą środę.",
          segments: [
              { start: 0, end: 5, text: "Mówca 1: Cześć wszystkim. Zaczynamy naszą burzę mózgów na temat kampanii letniej." },
              { start: 5, end: 7, text: "Ania, jakie masz pierwsze pomysły?" },
              { start: 8, end: 15, text: "Mówca 2: Myślałam o motywie 'Miejskie Odkrycia'. Skupilibyśmy się na lokalnych atrakcjach i promowali je przez social media, głównie Instagram i TikTok." },
              { start: 16, end: 19, text: "Mówca 1: Podoba mi się. To wpisuje się w trend 'slow travel'." },
              { start: 19, end: 21, text: "A co z grupą docelową?" },
              { start: 22, end: 28, text: "Mówca 2: Głównie ludzie w wieku 20-35 lat, aktywni, szukający nietypowych sposobów na spędzenie lata w mieście." },
              { start: 29, end: 35, text: "Mówca 3: Możemy dodać element grywalizacji. Na przykład konkurs na najlepsze zdjęcie z 'miejskiej wyprawy' z naszym produktem." },
              { start: 36, end: 41, text: "Mówca 1: Świetny pomysł, Piotrze. To zwiększy zaangażowanie." },
              { start: 41, end: 45, text: "Przygotujcie proszę zarys tej koncepcji na środę. Dziękuję." }
          ]
        }
    };
    const sampleSessionId3 = 'sid_example_3';
    const sampleSession3: Session = {
        id: sampleSessionId3,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        language: 'en',
        status: 'DONE',
        doSummary: true,
        aiModel: 'premium',
        title: 'API Integration Sync-up',
        durationSec: 62,
        artifacts: {
          rawTranscript: "Speaker 1: Okay, let's sync up on the user authentication API. Mark, what's the status on the OAuth 2.0 implementation?\nSpeaker 2: The authorization code flow is complete. I'm currently working on the refresh token logic. I've hit a small snag with token expiry validation on the server-side, but it should be resolved by EOD.\nSpeaker 1: Good. What about the endpoint for fetching user profiles? Is it ready for the frontend to consume?\nSpeaker 3: Almost. The endpoint is up, but I'm still finalizing the data structure. I want to make sure we're not over-fetching data. I'll publish the final schema to the shared Confluence page by tomorrow morning.\nSpeaker 1: Perfect. Let's make sure the error handling is robust. We need consistent error codes and messages for both failed authentication and profile fetch requests.\nSpeaker 2: Agreed. I've documented the proposed error codes in the API spec. Please review them when you get a chance.\nSpeaker 1: Will do. Thanks, team. Good progress.",
          summaryMd: "### TL;DR\n\nThe team discussed the user authentication API. The OAuth 2.0 flow is nearly complete, pending a fix for refresh token logic. The user profile endpoint is almost ready, with the final data schema to be published soon. The team emphasized the need for robust and consistent error handling.\n\n### Action Items\n\n- **Mark:** Resolve the server-side token expiry validation issue by the end of the day.\n- **Speaker 3:** Publish the final schema for the user profile endpoint to Confluence by tomorrow morning.\n- **All:** Review the proposed API error codes documented in the spec.",
          segments: [
              { start: 0, end: 5, text: "Speaker 1: Okay, let's sync up on the user authentication API." },
              { start: 5, end: 8, text: "Mark, what's the status on the OAuth 2.0 implementation?" },
              { start: 9, end: 17, text: "Speaker 2: The authorization code flow is complete. I'm currently working on the refresh token logic." },
              { start: 17, end: 23, text: "I've hit a small snag with token expiry validation on the server-side, but it should be resolved by EOD." },
              { start: 24, end: 28, text: "Speaker 1: Good. What about the endpoint for fetching user profiles?" },
              { start: 28, end: 30, text: "Is it ready for the frontend to consume?" },
              { start: 31, end: 38, text: "Speaker 3: Almost. The endpoint is up, but I'm still finalizing the data structure." },
              { start: 38, end: 41, text: "I want to make sure we're not over-fetching data." },
              { start: 41, end: 46, text: "I'll publish the final schema to the shared Confluence page by tomorrow morning." },
              { start: 47, end: 54, text: "Speaker 1: Perfect. Let's make sure the error handling is robust. We need consistent error codes and messages for both failed authentication and profile fetch requests." },
              { start: 55, end: 60, text: "Speaker 2: Agreed. I've documented the proposed error codes in the API spec. Please review them when you get a chance." },
              { start: 60, end: 62, text: "Speaker 1: Will do. Thanks, team. Good progress." }
          ]
        }
    };
    return { 
        [sampleSessionId1]: sampleSession1,
        [sampleSessionId2]: sampleSession2,
        [sampleSessionId3]: sampleSession3,
    };
};

export const useSessions = () => {
  const [sessions, dispatch] = useReducer(sessionsReducer, getInitialState());

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savableSessions = prepareSessionsForStorage(sessions);
        window.localStorage.setItem('sessions', JSON.stringify(savableSessions));
      } catch (e) {
        console.error("Failed to save sessions to localStorage", e);
      }
    }
  }, [sessions]);

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    dispatch({ type: 'ADD_OR_UPDATE', payload: { id, ...updates } as Session });
  }, []);

  const deleteSession = useCallback((id: string) => {
    dispatch({ type: 'DELETE', payload: id });
  }, []);

  const togglePinSession = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_PIN', payload: id });
  }, []);

  const deleteAllSessions = useCallback(() => {
    if (window.confirm("Are you sure you want to delete ALL sessions? This action cannot be undone.")) {
      dispatch({ type: 'DELETE_ALL' });
    }
  }, []);

  const reprocessSession = useCallback(async (id: string) => {
    const session = sessions[id];
    if (!session) {
      console.error(`Session with id ${id} not found.`);
      alert(`Session with id ${id} not found.`);
      return;
    }
    if (!session.audioBlob) {
      alert("Cannot reprocess session: Original audio data is not available. Reprocessing is only possible for sessions created in the current browser session before a refresh.");
      return;
    }

    alert(`Reprocessing session: ${session.title || session.id}`);
    try {
      await processAudioFile(session, (updates) => updateSession(id, updates));
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during reprocessing.';
      updateSession(id, { status: 'ERROR', error: errorMessage });
    }
  }, [sessions, updateSession]);

  const importSessions = useCallback((sessionsData: Record<string, Session>) => {
    if (typeof sessionsData !== 'object' || sessionsData === null || Array.isArray(sessionsData)) {
      alert('Invalid import file format. Expected a JSON object of sessions.');
      return;
    }
    // A simple check to see if the structure looks right
    const firstKey = Object.keys(sessionsData)[0];
    if (firstKey && (!sessionsData[firstKey].id || !sessionsData[firstKey].createdAt)) {
        alert('Invalid import file structure. Session objects appear to be malformed.');
        return;
    }
    dispatch({ type: 'SET_SESSIONS', payload: sessionsData });
    alert('Sessions imported successfully.');
  }, []);

  const createAndProcessSession = async (
    { blob, language, doSummary, aiModel }: { blob: Blob; language: Language; doSummary: boolean; aiModel: AiModel }
  ): Promise<Session> => {
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
    
    dispatch({ type: 'ADD_OR_UPDATE', payload: newSession });

    try {
      await processAudioFile(newSession, (updates) => updateSession(sessionId, updates));
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      updateSession(sessionId, { status: 'ERROR', error: errorMessage });
    }
    
    return newSession;
  };

  return { sessions, updateSession, deleteSession, togglePinSession, createAndProcessSession, deleteAllSessions, reprocessSession, importSessions };
};