export type SessionStatus = "QUEUED" | "PROCESSING" | "DONE" | "ERROR";
export type Language = "pl" | "en";
export type AiModel = 'fast' | 'advanced' | 'premium';

export type RecordingErrorType = 'PERMISSION_DENIED' | 'NOT_SUPPORTED' | 'NO_AUDIO_TRACK' | 'UNKNOWN';

export interface RecordingError {
    type: RecordingErrorType;
}

export interface Segment {
  start: number;
  end: number;
  text: string;
}

export interface Artifacts {
  // FIX: Made rawTranscript optional to align with reducer logic, which can create partial Artifacts objects during state updates.
  rawTranscript?: string;
  // FIX: Made segments optional to align with reducer logic.
  segments?: Segment[];
  summaryMd?: string;
}

export interface Session {
  id: string;
  title?: string;
  audioBlob?: Blob;
  language: Language;
  durationSec?: number;
  status: SessionStatus;
  createdAt: string;
  artifacts?: Artifacts;
  error?: string;
  doSummary: boolean;
  aiModel: AiModel;
  isPinned?: boolean;
}

export type AppView = 
  | { type: 'home' }
  | { type: 'session'; sessionId: string }
  | { type: 'history' }
  | { type: 'admin' };