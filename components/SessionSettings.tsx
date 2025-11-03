import React from 'react';
import type { Language, AiModel } from '../types';
import { STRINGS } from '../utils/i18n';
import { Spinner } from './Spinner';

interface SessionSettingsProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  aiModel: AiModel;
  onAiModelChange: (model: AiModel) => void;
  doSummary: boolean;
  onDoSummaryChange: (doSummary: boolean) => void;
  disabled: boolean;
  isDetectingLanguage: boolean;
  idPrefix: string;
  lang: 'en' | 'pl';
}

export const SessionSettings: React.FC<SessionSettingsProps> = ({
  language,
  onLanguageChange,
  aiModel,
  onAiModelChange,
  doSummary,
  onDoSummaryChange,
  disabled,
  isDetectingLanguage,
  idPrefix,
  lang,
}) => {
  return (
    <div className="w-full flex flex-col items-start gap-4 pt-6 border-t border-gray-200 dark:border-zinc-800/50 mt-4">
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor={`${idPrefix}-lang-select`} className="font-medium text-gray-700 dark:text-zinc-300 flex-shrink-0">{STRINGS[lang].language}:</label>
          <select
            id={`${idPrefix}-lang-select`}
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full p-2"
            disabled={disabled}
          >
            <option value="auto">{STRINGS[lang].languageAuto}</option>
            <option value="en">English</option>
            <option value="pl">Polski</option>
          </select>
          {isDetectingLanguage && <Spinner className="w-5 h-5 text-indigo-500" />}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor={`${idPrefix}-model-select`} className="font-medium text-gray-700 dark:text-zinc-300 flex-shrink-0">{STRINGS[lang].aiModel}:</label>
          <select
            id={`${idPrefix}-model-select`}
            value={aiModel}
            onChange={(e) => onAiModelChange(e.target.value as AiModel)}
            className="bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full p-2"
            disabled={disabled}
          >
            <option value="fast">{STRINGS[lang].modelFast}</option>
            <option value="advanced">{STRINGS[lang].modelAdvanced}</option>
            <option value="premium">{STRINGS[lang].modelPremium}</option>
          </select>
        </div>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="flex items-center">
          <input
            id={`${idPrefix}-summary-checkbox`}
            type="checkbox"
            checked={doSummary}
            onChange={(e) => onDoSummaryChange(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-zinc-700 border-gray-300 dark:border-zinc-600 rounded focus:ring-indigo-500 accent-indigo-500"
            disabled={disabled}
          />
          <label htmlFor={`${idPrefix}-summary-checkbox`} className="ml-2 text-sm font-medium text-gray-700 dark:text-zinc-300">{STRINGS[lang].autoSummary}</label>
        </div>
      </div>
    </div>
  );
};
