import React, { useContext } from 'react';
import type { AppView } from '../types';
import { ChevronLeftIcon } from './icons';
import { SettingsContext } from '../context/SettingsContext';
import { STRINGS } from '../utils/i18n';

interface CookiePolicyProps {
    setView: (view: AppView) => void;
}

const en = {
    title: "Cookie Policy",
    lastUpdated: "Last Updated: July 24, 2024",
    content: `
        <p>This page explains how meetsnap uses browser storage technologies. We do not use traditional HTTP cookies for tracking.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">What is Local Storage?</h3>
        <p>Local Storage is a standard web technology that allows a website or application to store data directly within your web browser on your device. Unlike cookies, data stored in Local Storage is not automatically sent to a server with every request. It remains on your computer until it is cleared.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">How We Use Local Storage</h3>
        <p>We use your browser's Local Storage to provide and improve the application's functionality. Specifically, we store:</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li><strong>Session Data:</strong> All your transcription sessions, including summaries and metadata, are saved here so you can access them later. This data is not accessible by us or any other website.</li>
            <li><strong>User Settings:</strong> Your preferences, such as the selected language and theme (light/dark mode), are stored to personalize your experience across visits.</li>
        </ul>

        <h3 class="font-bold mt-4 mb-2 text-lg">Your Choices</h3>
        <p>You have full control over the data stored in your browser's Local Storage. You can clear this data at any time through your browser's settings. Please note that clearing Local Storage will permanently delete all your saved sessions and reset your settings within the meetsnap application.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">Third-Party Cookies</h3>
        <p>Meetsnap does not use any third-party cookies for advertising or tracking purposes.</p>
    `
};

const pl = {
    title: "Polityka Cookies",
    lastUpdated: "Ostatnia aktualizacja: 24 lipca 2024",
    content: `
        <p>Ta strona wyjaśnia, w jaki sposób meetsnap wykorzystuje technologie przechowywania w przeglądarce. Nie używamy tradycyjnych plików cookie HTTP do śledzenia.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">Czym jest Pamięć Lokalna (Local Storage)?</h3>
        <p>Pamięć Lokalna to standardowa technologia internetowa, która pozwala stronie internetowej lub aplikacji przechowywać dane bezpośrednio w Twojej przeglądarce na Twoim urządzeniu. W przeciwieństwie do plików cookie, dane przechowywane w Pamięci Lokalnej nie są automatycznie wysyłane na serwer z każdym żądaniem. Pozostają na Twoim komputerze, dopóki nie zostaną usunięte.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">Jak Wykorzystujemy Pamięć Lokalną</h3>
        <p>Używamy Pamięci Lokalnej Twojej przeglądarki, aby zapewnić i ulepszyć funkcjonalność aplikacji. W szczególności przechowujemy:</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li><strong>Dane Sesji:</strong> Wszystkie Twoje sesje transkrypcji, w tym podsumowania i metadane, są tutaj zapisywane, abyś mógł uzyskać do nich dostęp później. Te dane nie są dostępne dla nas ani żadnej innej strony internetowej.</li>
            <li><strong>Ustawienia Użytkownika:</strong> Twoje preferencje, takie jak wybrany język i motyw (tryb jasny/ciemny), są przechowywane w celu personalizacji Twojego doświadczenia podczas kolejnych wizyt.</li>
        </ul>

        <h3 class="font-bold mt-4 mb-2 text-lg">Twoje Wybory</h3>
        <p>Masz pełną kontrolę nad danymi przechowywanymi w Pamięci Lokalnej Twojej przeglądarki. Możesz usunąć te dane w dowolnym momencie w ustawieniach swojej przeglądarki. Pamiętaj, że wyczyszczenie Pamięci Lokalnej trwale usunie wszystkie zapisane sesje i zresetuje Twoje ustawienia w aplikacji meetsnap.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">Pliki Cookie Stron Trzecich</h3>
        <p>Meetsnap nie używa żadnych plików cookie stron trzecich w celach reklamowych ani śledzących.</p>
    `
};

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ setView }) => {
    const { lang } = useContext(SettingsContext);
    const t = lang === 'pl' ? pl : en;

    return (
        <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg p-4 sm:p-6 space-y-4">
            <header className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800/50">
                <button
                    onClick={() => setView({ type: 'home' })}
                    className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
                    aria-label={STRINGS[lang].backToHome}
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-black dark:text-white">{t.title}</h2>
            </header>
            <div className="prose dark:prose-invert max-w-none prose-p:text-gray-600 dark:prose-p:text-zinc-300 prose-headings:text-gray-900 dark:prose-headings:text-white">
                <p className="text-sm text-gray-500 dark:text-zinc-400">{t.lastUpdated}</p>
                <div dangerouslySetInnerHTML={{ __html: t.content }} />
            </div>
        </div>
    );
};