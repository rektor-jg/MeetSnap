import React, { useContext } from 'react';
import { Spinner } from './Spinner';
import { STRINGS } from '../utils/i18n';
import { SettingsContext } from '../context/SettingsContext';

export const ProcessingView: React.FC = () => {
  const { lang } = useContext(SettingsContext);
  return (
    <div className="text-center p-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/30">
        <Spinner className="w-10 h-10 mx-auto mb-4 text-indigo-500 dark:text-indigo-400"/>
        <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{STRINGS[lang].statusProcessing}</h3>
        <p className="text-gray-500 dark:text-zinc-400">Your recording is being analyzed. This might take a few moments...</p>
    </div>
  );
};