import React, { useState, useCallback, useContext } from 'react';
import type { Language, AiModel } from '../types';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_AUDIO_TYPES } from '../constants';
import { UploadIcon, YoutubeIcon, MusicalNoteIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { useSettings } from '../context/SettingsContext';
import { detectLanguageFromAudio } from '../services/geminiService';
import { SessionSettings } from './SessionSettings';

interface UploadPanelProps {
  onSubmit: (params: { file?: File; youtubeUrl?: string; language: Language; doSummary: boolean; aiModel: AiModel }) => void;
}

type UploadMode = 'file' | 'youtube';

export const UploadPanel: React.FC<UploadPanelProps> = ({ onSubmit }) => {
  const { lang } = useSettings();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('auto');
  const [doSummary, setDoSummary] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [aiModel, setAiModel] = useState<AiModel>('fast');
  const [isDetecting, setIsDetecting] = useState(false);


  const validateFile = (selectedFile: File): boolean => {
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(STRINGS[lang].fileValidationSize);
      return false;
    }
    // Simple extension check for m4a as type can be unreliable
    const isM4A = selectedFile.name.toLowerCase().endsWith('.m4a');
    if (!ACCEPTED_AUDIO_TYPES.includes(selectedFile.type) && !isM4A) {
      setError(STRINGS[lang].fileValidationType);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = async (selectedFile: File | null) => {
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      
      if (language === 'auto') {
        setIsDetecting(true);
        try {
          const detectedLang = await detectLanguageFromAudio(selectedFile);
          if (detectedLang) {
            setLanguage(detectedLang);
          }
        } catch (error) {
          console.error("Language detection failed in UploadPanel:", error);
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
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileChange(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [lang, language]);

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const onDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const isValidYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'file' && file) {
      onSubmit({ file, language, doSummary, aiModel });
    } else if (uploadMode === 'youtube' && isValidYoutubeUrl(youtubeUrl)) {
      onSubmit({ youtubeUrl, language, doSummary, aiModel });
    }
  };

  const tabClasses = (tabName: UploadMode) =>
    `w-full py-2 text-sm font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-gray-200 dark:focus:ring-offset-black/20 ${
      uploadMode === tabName
        ? 'bg-white dark:bg-zinc-700 text-gray-800 dark:text-white shadow-sm'
        : 'text-gray-500 dark:text-zinc-400 hover:bg-white/70 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200'
    }`;
    
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/50 dark:bg-black/20 rounded-lg">
          <button type="button" onClick={() => setUploadMode('file')} className={tabClasses('file')}>
              {STRINGS[lang].uploadFile}
          </button>
          <button type="button" onClick={() => setUploadMode('youtube')} className={tabClasses('youtube')}>
              {STRINGS[lang].youtubeLink}
          </button>
      </div>
      
      {uploadMode === 'file' ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
            isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-105' : 'border-gray-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-zinc-600 bg-gray-50 dark:bg-zinc-800/50 hover:bg-indigo-500/5 dark:hover:bg-zinc-800'
          }`}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept={ACCEPTED_AUDIO_TYPES.join(',')}
            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          />
          <div className="text-center">
            {file ? (
                <>
                    <MusicalNoteIcon className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    <p className="mt-2 text-sm text-gray-800 dark:text-white font-medium max-w-full truncate px-2" title={file.name}>
                        {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                </>
            ) : (
                <>
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-zinc-500"/>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{STRINGS[lang].dropFileHere}</span>
                    </p>
                </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center w-full border border-gray-300 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800/50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                <span className="pl-3 pointer-events-none">
                  <YoutubeIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                </span>
                <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder={STRINGS[lang].youtubePlaceholder}
                    className="w-full pl-2 pr-4 py-3 bg-transparent text-black dark:text-white focus:outline-none"
                />
            </div>
             <p className="text-center text-xs text-gray-500 dark:text-zinc-400 mt-3">{STRINGS[lang].youtubeProcessingNote}</p>
        </div>
      )}
      
      {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}

      <SessionSettings
        lang={lang}
        idPrefix="upload"
        language={language}
        onLanguageChange={setLanguage}
        aiModel={aiModel}
        onAiModelChange={setAiModel}
        doSummary={doSummary}
        onDoSummaryChange={setDoSummary}
        disabled={false}
        isDetectingLanguage={isDetecting}
      />

      <button
        type="submit"
        disabled={ (uploadMode === 'file' && !file) || (uploadMode === 'youtube' && !isValidYoutubeUrl(youtubeUrl)) }
        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-zinc-400 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900"
      >
        {STRINGS[lang].submit}
      </button>
    </form>
  );
};