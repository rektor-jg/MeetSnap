import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import type { AppView, Session, Language, AiModel, RecordingErrorType } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { formatTime } from '../utils/formatUtils';
import { SoundWaveIcon, PauseIcon, PlayIcon, StopIcon, DownloadIcon, ErrorIcon, MicrophoneIcon, UploadIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { SettingsContext } from '../context/SettingsContext';
import { detectLanguageFromAudio } from '../services/geminiService';
import { SessionSettings } from './SessionSettings';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_AUDIO_TYPES } from '../constants';


interface HomeViewV2Props {
  onSubmit: (params: { blob?: Blob, youtubeUrl?: string, language: Language, doSummary: boolean, aiModel: AiModel }) => Promise<Session>;
  setView: (view: AppView) => void;
}

const getErrorMessage = (type: RecordingErrorType, lang: Language) => {
    switch (type) {
        case 'PERMISSION_DENIED': return STRINGS[lang].errorPermissionDenied;
        case 'NOT_SUPPORTED': return STRINGS[lang].errorNotSupported;
        case 'NO_AUDIO_TRACK': return STRINGS[lang].errorNoAudioTrack;
        default: return STRINGS[lang].errorUnknown;
    }
};

export const HomeViewV2: React.FC<HomeViewV2Props> = ({ onSubmit, setView }) => {
  const { lang } = useContext(SettingsContext);
  const [language, setLanguage] = useState<Language>('auto');
  const [doSummary, setDoSummary] = useState(true);
  const [aiModel, setAiModel] = useState<AiModel>('fast');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [includeMicrophone, setIncludeMicrophone] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionAttempted = useRef(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStopRecording = useCallback(async (blob: Blob) => {
    const newSession = await onSubmit({ blob, language, doSummary, aiModel });
    setView({ type: 'session', sessionId: newSession.id });
  }, [doSummary, language, aiModel, onSubmit, setView]);

  const handleDataAvailable = useCallback(async (chunk: Blob) => {
    if (detectionAttempted.current || isDetecting || language !== 'auto') return;
    detectionAttempted.current = true;
    setIsDetecting(true);
    try {
        const detectedLang = await detectLanguageFromAudio(chunk);
        if (detectedLang) setLanguage(detectedLang);
    } catch (error) {
        console.error("Language detection failed:", error);
    } finally {
        setIsDetecting(false);
    }
  }, [isDetecting, language]);

  const { status, time, start, stop, pause, resume, error: recorderError } = useMediaRecorder({ 
    onStop: handleStopRecording,
    onDataAvailable: handleDataAvailable,
  });
  
  useEffect(() => {
    if (recorderError) setIsErrorVisible(true);
  }, [recorderError]);

  const isRecording = status === 'recording' || status === 'paused';

  const handleStartRecording = () => {
    setFile(null);
    setFileError(null);
    detectionAttempted.current = false;
    start({ includeMicrophone });
  };
  
  // File Upload Logic
  const validateFile = (selectedFile: File): boolean => {
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFileError(STRINGS[lang].fileValidationSize);
      return false;
    }
    const isM4A = selectedFile.name.toLowerCase().endsWith('.m4a');
    if (!ACCEPTED_AUDIO_TYPES.includes(selectedFile.type) && !isM4A) {
      setFileError(STRINGS[lang].fileValidationType);
      return false;
    }
    setFileError(null);
    return true;
  };

  const handleFileChange = async (selectedFile: File | null) => {
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      if (language === 'auto') {
        setIsDetecting(true);
        try {
          const detectedLang = await detectLanguageFromAudio(selectedFile);
          if (detectedLang) setLanguage(detectedLang);
        } catch (error) {
          console.error("Language detection failed:", error);
        } finally {
          setIsDetecting(false);
        }
      }
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (isRecording) return;
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [lang, language, isRecording]);

  const handleSubmitFile = async () => {
    if (file) {
      const newSession = await onSubmit({ blob: file, language, doSummary, aiModel });
      setView({ type: 'session', sessionId: newSession.id });
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, entering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRecording) setIsDragging(entering);
  };
  
  const MAX_VISUAL_SECONDS = 300;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((time / MAX_VISUAL_SECONDS), 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 mb-2">{STRINGS[lang].appHeadline}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">{STRINGS[lang].appSubhead}</p>
        </div>

        <div
            onDrop={onDrop}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onClick={() => !file && !isRecording && fileInputRef.current?.click()}
            className={`relative bg-gray-50 dark:bg-zinc-900 border-2 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30 overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 min-h-[400px] transition-all duration-300
                ${isDragging ? 'border-indigo-500 border-dashed bg-indigo-500/5 scale-105' : 'border-gray-200 dark:border-zinc-800/50 border-solid'}
                ${isRecording || file ? '' : 'cursor-pointer'}`
            }
        >
            <input type="file" ref={fileInputRef} className="hidden" accept={ACCEPTED_AUDIO_TYPES.join(',')} onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
            
            {isErrorVisible && recorderError && (
                <div className="absolute top-4 left-4 right-4 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-3 z-10" role="alert">
                    <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                    <div><strong className="font-bold">{STRINGS[lang].statusError}</strong><span className="ml-1">{getErrorMessage(recorderError.type, lang)}</span></div>
                    <button onClick={(e) => { e.stopPropagation(); setIsErrorVisible(false); }} className="ml-auto" aria-label="Close">
                        <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                </div>
            )}
            
            <div className="flex flex-col items-center justify-center text-center flex-grow">
                {!file && (
                    <>
                        <div className={`relative flex items-center justify-center w-40 h-40 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500/10 dark:bg-red-900/50' : 'bg-gray-200 dark:bg-zinc-800'}`}>
                            {isRecording && (
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle className="text-red-500/20" stroke="currentColor" strokeWidth="6" fill="transparent" r={radius} cx="75" cy="75"/>
                                    <circle className="text-red-500" stroke="currentColor" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" r={radius} cx="75" cy="75" style={{ transition: 'stroke-dashoffset 0.5s linear' }}/>
                                </svg>
                            )}
                            <SoundWaveIcon className={`relative w-16 h-16 transition-colors ${isRecording ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-zinc-400'}`} />
                        </div>
                        <p className="text-5xl font-mono text-black dark:text-white tracking-wider mt-4">{formatTime(time)}</p>
                    </>
                )}
                
                {file && !isRecording && (
                    <div className="flex flex-col items-center gap-3">
                        <UploadIcon className="w-16 h-16 text-gray-400 dark:text-zinc-500" />
                        <p className="font-semibold text-gray-800 dark:text-white">{file.name}</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-400">{Math.round(file.size / 1024 / 1024 * 100) / 100} MB</p>
                    </div>
                )}
            </div>

            <div className="w-full max-w-lg mt-6">
                <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
                    {status === 'idle' && !file && <p className="text-gray-500 dark:text-zinc-400 mb-2">{STRINGS[lang].dropOrRecord}</p>}
                    {status === 'idle' && file && <button onClick={handleSubmitFile} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105">{STRINGS[lang].submit}</button>}
                    {status === 'idle' && !file && <button onClick={(e) => {e.stopPropagation(); handleStartRecording();}} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-transform transform hover:scale-105"><PlayIcon className="w-5 h-5"/><span>{STRINGS[lang].startRecording}</span></button>}
                    
                    {isRecording && (
                        <div className="w-full flex flex-col items-center gap-3">
                            <button onClick={(e) => { e.stopPropagation(); status === 'recording' ? pause() : resume();}} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform transform hover:scale-105" aria-label={status === 'recording' ? STRINGS[lang].pauseRecording : STRINGS[lang].resumeRecording}>
                                {status === 'recording' ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                                <span>{status === 'recording' ? STRINGS[lang].pauseRecording : STRINGS[lang].resumeRecording}</span>
                            </button>
                            <button onClick={(e) => {e.stopPropagation(); stop();}} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
                                <StopIcon className="w-5 h-5"/>
                                <span>{STRINGS[lang].stopAndSubmit}</span>
                            </button>
                        </div>
                    )}
                </div>

                <SessionSettings lang={lang} idPrefix="v2" language={language} onLanguageChange={setLanguage} aiModel={aiModel} onAiModelChange={setAiModel} doSummary={doSummary} onDoSummaryChange={setDoSummary} disabled={isRecording} isDetectingLanguage={isDetecting} />
                
                <div className="flex items-center justify-center mt-4">
                    <input id="mic-checkbox-v2" type="checkbox" checked={includeMicrophone} onChange={(e) => { e.stopPropagation(); setIncludeMicrophone(e.target.checked);}} className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 rounded focus:ring-indigo-500 accent-indigo-500" disabled={isRecording} />
                    <label htmlFor="mic-checkbox-v2" className="ml-2 text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}><MicrophoneIcon className="w-4 h-4"/>{STRINGS[lang].includeMicrophone}</label>
                </div>
            </div>
            
            {fileError && <p className="absolute bottom-4 text-red-500 dark:text-red-400 text-sm">{fileError}</p>}
        </div>
    </div>
  );
};