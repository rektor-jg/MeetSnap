import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Language, AiModel, RecordingErrorType } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { formatTime } from '../utils/formatUtils';
import { SoundWaveIcon, PauseIcon, PlayIcon, StopIcon, DownloadIcon, ErrorIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { useSettings } from '../context/SettingsContext';
import { detectLanguageFromAudio } from '../services/geminiService';
import { SessionSettings } from './SessionSettings';

interface RecordPanelProps {
  onSubmit: (blob: Blob, language: Language, doSummary: boolean, aiModel: AiModel) => void;
}

const getErrorMessage = (type: RecordingErrorType, lang: Language | 'en' | 'pl') => {
    switch (type) {
        case 'PERMISSION_DENIED':
            return STRINGS[lang].errorPermissionDenied;
        case 'NOT_SUPPORTED':
            return STRINGS[lang].errorNotSupported;
        case 'NO_AUDIO_TRACK':
            return STRINGS[lang].errorNoAudioTrack;
        default:
            return STRINGS[lang].errorUnknown;
    }
};

export const RecordPanel: React.FC<RecordPanelProps> = ({ onSubmit }) => {
  const { lang } = useSettings();
  const [language, setLanguage] = useState<Language>('auto');
  const [doSummary, setDoSummary] = useState(true);
  const [aiModel, setAiModel] = useState<AiModel>('fast');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [includeMicrophone, setIncludeMicrophone] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionAttempted = useRef(false);

  const handleStop = useCallback((blob: Blob) => {
    if (doSummary) {
      onSubmit(blob, language, doSummary, aiModel);
    } else {
      setRecordedBlob(blob);
    }
  }, [doSummary, language, aiModel, onSubmit]);

  const handleDataAvailable = useCallback(async (chunk: Blob) => {
    if (detectionAttempted.current || isDetecting || language !== 'auto') {
        return;
    }
    detectionAttempted.current = true;
    setIsDetecting(true);
    try {
        const detectedLang = await detectLanguageFromAudio(chunk);
        if (detectedLang) {
            setLanguage(detectedLang);
        }
    } catch (error) {
        console.error("Language detection failed in RecordPanel:", error);
    } finally {
        setIsDetecting(false);
    }
  }, [isDetecting, language]);

  const { status, time, start, stop, pause, resume, error } = useMediaRecorder({ 
    onStop: handleStop,
    onDataAvailable: handleDataAvailable,
  });
  
  useEffect(() => {
    if (error) {
        setIsErrorVisible(true);
    }
  }, [error]);

  const isRecording = status === 'recording' || status === 'paused';

  const handleStartRecording = () => {
    detectionAttempted.current = false;
    start({ includeMicrophone });
  };

  const handleDownload = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleRecordAgain = () => {
    setRecordedBlob(null);
  };

  const MAX_VISUAL_SECONDS = 300; // 5 minutes for progress visualization
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((time / MAX_VISUAL_SECONDS), 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  if (recordedBlob) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h3 className="text-2xl font-bold text-black dark:text-white">Recording Finished</h3>
        <p className="text-gray-500 dark:text-zinc-400">Your recording is ready for download.</p>
        <p className="text-3xl font-mono text-black dark:text-white tracking-wider">{formatTime(time)}</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={handleDownload} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
            <DownloadIcon className="w-5 h-5" />
            <span>{STRINGS[lang].downloadRecording}</span>
          </button>
          <button onClick={handleRecordAgain} className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white font-bold py-3 px-6 rounded-full transition-colors">
            {STRINGS[lang].recordAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
       {isErrorVisible && error && (
            <div className="w-full bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <div className="flex items-start">
                    <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                    <div className="ml-3">
                        <strong className="font-bold">{STRINGS[lang].statusError}</strong>
                        <span className="block sm:inline ml-1">{getErrorMessage(error.type, lang)}</span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsErrorVisible(false)} 
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    aria-label="Close"
                >
                    <svg className="fill-current h-6 w-6 text-red-600 dark:text-red-400/70" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        )}
      <div className={`relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500/10 dark:bg-red-900/50' : 'bg-gray-200 dark:bg-zinc-800'}`}>
        {isRecording && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              className="text-red-500/20"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
            <circle
              className="text-red-500"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
        )}
        <SoundWaveIcon className={`relative w-12 h-12 sm:w-14 sm:h-14 transition-colors ${isRecording ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-zinc-400'}`} />
      </div>
      
      <p className="text-4xl sm:text-5xl font-mono text-black dark:text-white tracking-wider">{formatTime(time)}</p>

      <div className="flex flex-col items-center gap-3 w-full max-w-[300px]">
        {status === 'idle' && (
          <button onClick={handleStartRecording} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
            <PlayIcon className="w-5 h-5"/>
            <span>{STRINGS[lang].startRecording}</span>
          </button>
        )}
        {isRecording && (
            <div className="w-full flex flex-col items-center gap-3">
                <button 
                  onClick={status === 'recording' ? pause : resume} 
                  className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900"
                  aria-label={status === 'recording' ? STRINGS[lang].pauseRecording : STRINGS[lang].resumeRecording}
                >
                    {status === 'recording' ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                    <span>{status === 'recording' ? STRINGS[lang].pauseRecording : STRINGS[lang].resumeRecording}</span>
                </button>
                <button onClick={stop} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
                    <StopIcon className="w-5 h-5"/>
                    <span>{doSummary ? STRINGS[lang].stopAndSubmit : STRINGS[lang].stopAndDownload}</span>
                </button>
            </div>
        )}
      </div>

      <div className="w-full max-w-lg">
        <SessionSettings
          lang={lang}
          idPrefix="record"
          language={language}
          onLanguageChange={setLanguage}
          aiModel={aiModel}
          onAiModelChange={setAiModel}
          doSummary={doSummary}
          onDoSummaryChange={setDoSummary}
          disabled={isRecording}
          isDetectingLanguage={isDetecting}
          showMicrophoneOption={true}
          includeMicrophone={includeMicrophone}
          onIncludeMicrophoneChange={setIncludeMicrophone}
        />
      </div>
    </div>
  );
};