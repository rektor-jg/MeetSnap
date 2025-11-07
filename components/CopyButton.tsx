import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { useSettings } from '../context/SettingsContext';

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const { lang } = useSettings();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const buttonClasses = `
    flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900
    ${copied
      ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
      : 'text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border-gray-300/70 dark:border-zinc-700/50'
    }
  `;

  return (
    <button onClick={handleCopy} className={buttonClasses} disabled={copied}>
      {copied ? (
        <>
          <CheckIcon className="w-4 h-4" />
          <span>{STRINGS[lang].copied}</span>
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4" />
          <span>{STRINGS[lang].copy}</span>
        </>
      )}
    </button>
  );
};