import React, { useState } from 'react';
import { getCustomApiKey, setCustomApiKey, clearCustomApiKey } from '../utils/apiKey';

export const ApiKeyManager: React.FC = () => {
    const [customKeyInput, setCustomKeyInput] = useState(getCustomApiKey() || '');
    const [saved, setSaved] = useState(false);
    // We need a state to force re-render when local storage changes
    const [hasCustomKeyState, setHasCustomKeyState] = useState(!!getCustomApiKey());

    const handleSave = () => {
        setCustomApiKey(customKeyInput);
        setHasCustomKeyState(!!getCustomApiKey());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClear = () => {
        clearCustomApiKey();
        setCustomKeyInput('');
        setHasCustomKeyState(false);
    };
    
    return (
        <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50 space-y-3">
            <h4 className="font-semibold text-black dark:text-white">Custom API Key</h4>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
                Override the default API key (e.g., from Gemini, OpenAI, OpenRouter). The key is stored securely in your browser's local storage and is never sent to our servers.
            </p>
            <div>
                <input
                    type="password"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder={hasCustomKeyState ? "Custom key is set and hidden" : "Paste your API key here"}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5"
                />
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSave}
                    className="flex-grow text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    {saved ? 'Saved!' : 'Save Custom Key'}
                </button>
                <button
                    onClick={handleClear}
                    disabled={!hasCustomKeyState}
                    className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Clear Key
                </button>
            </div>
        </div>
    );
};