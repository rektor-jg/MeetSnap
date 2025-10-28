import React, { useState, useCallback } from 'react';
import type { Language, AiModel, RecordingErrorType } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { formatTime } from '../utils/formatUtils';
import { MicIcon, PauseIcon, PlayIcon, StopIcon, DownloadIcon } from './icons';
import { STRINGS } from '../utils/i18n';

interface RecordPanelProps {
  onSubmit: (blob: Blob, language: Language, doSummary: boolean, aiModel: AiModel) => void;
  lang: Language;
}

const getErrorMessage = (type: RecordingErrorType, lang: Language) => {
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

export const RecordPanel: React.FC<RecordPanelProps> = ({ onSubmit, lang }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [doSummary, setDoSummary] = useState(true);
  const [aiModel, setAiModel] = useState<AiModel>('fast');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const handleStop = useCallback((blob: Blob) => {
    if (doSummary) {
      onSubmit(blob, language, doSummary, aiModel);
    } else {
      setRecordedBlob(blob);
    }
  }, [doSummary, language, aiModel, onSubmit]);

  const { status, time, start, stop, pause, resume, error } = useMediaRecorder({ onStop: handleStop });

  const isRecording = status === 'recording' || status === 'paused';

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
  
  if (recordedBlob) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h3 className="text-2xl font-bold text-black dark:text-white">Recording Finished</h3>
        <p className="text-gray-500 dark:text-zinc-400">Your recording is ready for download.</p>
        <p className="text-3xl font-mono text-black dark:text-white tracking-wider">{formatTime(time)}</p>
        <div className="flex items-center gap-4">
          <button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
            <DownloadIcon className="w-5 h-5" />
            <span>{STRINGS[lang].downloadRecording}</span>
          </button>
          <button onClick={handleRecordAgain} className="bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white font-bold py-3 px-6 rounded-full transition-colors">
            {STRINGS[lang].recordAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
       {error && (
            <div className="w-full bg-red-100 dark:bg-red-500/10 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4" role="alert">
                <p className="font-bold">{STRINGS[lang].statusError}</p>
                <p>{getErrorMessage(error.type, lang)}</p>
            </div>
        )}
      <div className={`relative flex items-center justify-center w-36 h-36 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500/10 dark:bg-red-900/50' : 'bg-gray-200 dark:bg-zinc-800'}`}>
        {isRecording && <div className="absolute inset-0 rounded-full bg-red-500/10 dark:bg-red-500/20 animate-[pulse_1.5s_infinite]"></div>}
        <MicIcon className={`w-14 h-14 transition-colors ${isRecording ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-zinc-400'}`} />
      </div>
      
      <p className="text-5xl font-mono text-black dark:text-white tracking-wider">{formatTime(time)}</p>

      <div className="flex items-center gap-4 h-14">
        {status === 'idle' && (
          <button onClick={start} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
            <PlayIcon className="w-5 h-5"/>
            <span>{STRINGS[lang].startRecording}</span>
          </button>
        )}
        {status === 'recording' && (
            <>
                <button onClick={pause} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold w-14 h-14 rounded-full flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
                    <PauseIcon className="w-6 h-6"/>
                </button>
                <button onClick={stop} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
                    <StopIcon className="w-5 h-5"/>
                    <span>{doSummary ? STRINGS[lang].stopAndSubmit : STRINGS[lang].stopAndDownload}</span>
                </button>
            </>
        )}
        {status === 'paused' && (
            <>
                <button onClick={resume} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold w-14 h-14 rounded-full flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
                    <PlayIcon className="w-6 h-6"/>
                </button>
                <button onClick={stop} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-zinc-900">
                    <StopIcon className="w-5 h-5"/>
                    <span>{doSummary ? STRINGS[lang].stopAndSubmit : STRINGS[lang].stopAndDownload}</span>
                </button>
            </>
        )}
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center sm:justify-between gap-x-8 gap-y-4 pt-6 border-t border-gray-200 dark:border-zinc-800/50 mt-4">
        <div className="flex items-center gap-2">
            <label htmlFor="lang-select-record" className="font-medium text-gray-700 dark:text-zinc-300 flex-shrink-0">{STRINGS[lang].language}:</label>
            <select
                id="lang-select-record"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full p-2"
                disabled={isRecording}
            >
                <option value="en">English</option>
                <option value="pl">Polski</option>
            </select>
        </div>

        <div className="flex items-center gap-2">
            <label htmlFor="model-select-record" className="font-medium text-gray-700 dark:text-zinc-300 flex-shrink-0">{STRINGS[lang].aiModel}:</label>
            <select
                id="model-select-record"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value as AiModel)}
                className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full p-2"
                disabled={isRecording}
            >
                <option value="fast">{STRINGS[lang].modelFast}</option>
                <option value="advanced">{STRINGS[lang].modelAdvanced}</option>
                <option value="premium">{STRINGS[lang].modelPremium}</option>
            </select>
        </div>

        <div className="flex items-center">
            <input
                id="summary-checkbox-record"
                type="checkbox"
                checked={doSummary}
                onChange={(e) => setDoSummary(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 rounded focus:ring-indigo-500 accent-indigo-500"
                disabled={isRecording}
            />
            <label htmlFor="summary-checkbox-record" className="ml-2 text-sm font-medium text-gray-700 dark:text-zinc-300">{STRINGS[lang].autoSummary}</label>
        </div>
      </div>
    </div>
  );
};