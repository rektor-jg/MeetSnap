import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import type { AppView, Session, Language, AiModel, RecordingErrorType } from '../types';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { formatTime } from '../utils/formatUtils';
import { PauseIcon, PlayIcon, StopIcon, ErrorIcon, MicrophoneIcon, UploadIcon, SettingsIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { SettingsContext } from '../context/SettingsContext';
import { detectLanguageFromAudio } from '../services/geminiService';
import { SessionSettings } from './SessionSettings';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_AUDIO_TYPES } from '../constants';

interface HomeViewV3Props {
  onSubmit: (params: { blob?: Blob; youtubeUrl?: string; language: Language; doSummary: boolean; aiModel: AiModel }) => Promise<Session>;
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

export const HomeViewV3: React.FC<HomeViewV3Props> = ({ onSubmit, setView }) => {
  const { lang } = useContext(SettingsContext);
  const [language, setLanguage] = useState<Language>('auto');
  const [doSummary, setDoSummary] = useState(true);
  const [aiModel, setAiModel] = useState<AiModel>('fast');
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [includeMicrophone, setIncludeMicrophone] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const detectionAttempted = useRef(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Visualizer refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>(0);
  const sphereRef = useRef<HTMLDivElement>(null);

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

  const setupVisualizer = (stream: MediaStream) => {
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      analyserRef.current = audioContext.createAnalyser();
      sourceRef.current = audioContext.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 128;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
  };
  
  const { status, time, start, stop, pause, resume, error: recorderError } = useMediaRecorder({ 
    onStop: handleStopRecording,
    onDataAvailable: handleDataAvailable,
    onStreamReady: setupVisualizer,
  });
  
  const draw = useCallback(() => {
    if (status !== 'recording' || !analyserRef.current || !dataArrayRef.current || !sphereRef.current) {
      return;
    }
    animationFrameRef.current = requestAnimationFrame(draw);
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const average = dataArrayRef.current.reduce((acc, val) => acc + val, 0) / dataArrayRef.current.length;
    const scale = 1 + (average / 256) * 0.2;
    const glowOpacity = Math.min(0.2 + (average / 256) * 0.8, 1);
    sphereRef.current.style.setProperty('--sphere-scale', `${scale}`);
    sphereRef.current.style.setProperty('--glow-opacity', `${glowOpacity}`);
  }, [status]);

  useEffect(() => {
    if (status === 'recording') {
        draw();
    } else {
        cancelAnimationFrame(animationFrameRef.current);
        if (sphereRef.current) {
            sphereRef.current.style.setProperty('--sphere-scale', '1');
            sphereRef.current.style.setProperty('--glow-opacity', '0.2');
        }
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [status, draw]);
  
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
  
  const handleSphereClick = () => {
    if (file) {
      handleSubmitFile();
    } else if (status === 'idle') {
      handleStartRecording();
    } else if (status === 'recording' || status === 'paused') {
      stop();
    }
  };

  return (
    <div 
        onDrop={onDrop}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 z-20">
            <button onClick={() => setIsSettingsOpen(p => !p)} className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <SettingsIcon className="w-6 h-6" />
            </button>
        </div>
        
        {isErrorVisible && recorderError && (
             <div className="absolute top-4 left-4 right-4 max-w-md mx-auto bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-3 z-30" role="alert">
                <ErrorIcon className="w-5 h-5 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                <div><strong className="font-bold">{STRINGS[lang].statusError}</strong><span className="ml-1">{getErrorMessage(recorderError.type, lang)}</span></div>
                <button onClick={() => setIsErrorVisible(false)} className="ml-auto" aria-label="Close">
                    <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        )}

        {/* Settings Panel */}
        <aside className={`absolute top-0 right-0 h-full bg-gray-50 dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 shadow-2xl p-6 transform transition-transform duration-300 ease-in-out z-10 w-full max-w-sm ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <h3 className="text-xl font-bold mb-6 text-black dark:text-white">Settings</h3>
            <SessionSettings lang={lang} idPrefix="v3" language={language} onLanguageChange={setLanguage} aiModel={aiModel} onAiModelChange={setAiModel} doSummary={doSummary} onDoSummaryChange={setDoSummary} disabled={isRecording} isDetectingLanguage={isDetecting} />
            <div className="flex items-center mt-4">
                <input id="mic-checkbox-v3" type="checkbox" checked={includeMicrophone} onChange={(e) => setIncludeMicrophone(e.target.checked)} className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 rounded focus:ring-indigo-500 accent-indigo-500" disabled={isRecording} />
                <label htmlFor="mic-checkbox-v3" className="ml-2 text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1.5"><MicrophoneIcon className="w-4 h-4"/>{STRINGS[lang].includeMicrophone}</label>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </aside>


        <div className="flex flex-col items-center justify-center text-center relative z-0">
            <div 
                ref={sphereRef}
                style={{ '--sphere-scale': 1, '--glow-opacity': 0.2 } as React.CSSProperties}
                onClick={handleSphereClick}
                className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full cursor-pointer transition-all duration-300 group
                    ${isRecording ? 'bg-red-500/10' : file ? 'bg-indigo-500/10' : 'bg-gray-200 dark:bg-zinc-800/50'}
                    ${isDragging ? 'border-4 border-dashed border-indigo-500' : 'border-none'}
                    transform-gpu scale-[var(--sphere-scale)]`}
            >
                <div className={`absolute inset-0 rounded-full bg-indigo-400 opacity-[var(--glow-opacity)] blur-2xl transition-opacity duration-200`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    {file && !isRecording && <UploadIcon className="w-16 h-16 text-indigo-400" />}
                    {!file && isRecording && <div className="w-16 h-16 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />}
                    {!file && !isRecording && (
                        <div className="w-16 h-16 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform" />
                    )}
                </div>
            </div>
            
            <p className="text-5xl font-mono text-black dark:text-white tracking-wider mt-8">
              {isRecording ? formatTime(time) : (file?.name ? '' : '00:00')}
            </p>

            <div className="mt-4 h-12">
              {status === 'idle' && !file && <p className="text-gray-500 dark:text-zinc-400">{STRINGS[lang].dropOrRecordSphere}</p>}
              {file && !isRecording && <p className="font-semibold text-gray-800 dark:text-white animate-pulse">{file.name}</p>}
              {isRecording && (
                <div className="flex items-center gap-4">
                  <button onClick={(e) => { e.stopPropagation(); stop(); }} className="bg-red-600/80 hover:bg-red-600 text-white p-4 rounded-full backdrop-blur-sm transition-transform transform hover:scale-110">
                    <StopIcon className="w-6 h-6"/>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); status === 'recording' ? pause() : resume();}} className="bg-gray-600/80 hover:bg-gray-600 text-white p-4 rounded-full backdrop-blur-sm transition-transform transform hover:scale-110">
                      {status === 'recording' ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                  </button>
                </div>
              )}
            </div>

            {fileError && <p className="absolute bottom-[-2rem] text-red-500 dark:text-red-400 text-sm">{fileError}</p>}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept={ACCEPTED_AUDIO_TYPES.join(',')} onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
    </div>
  );
};