import React from 'react';
import type { AppView } from '../types';
import { ChevronLeftIcon } from './icons';
import { useSettings } from '../context/SettingsContext';
import { STRINGS } from '../utils/i18n';

interface PrivacyPolicyProps {
    setView: (view: AppView) => void;
}

const en = {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: July 24, 2024",
    content: `
        <p>This Privacy Policy describes how meetsnap ("we," "us," or "our") handles your information when you use our application.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">1. Information We Process</h3>
        <p>Meetsnap is designed to function entirely on the client-side, meaning your data is processed and stored locally in your browser.</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li><strong>Audio Data:</strong> When you record or upload an audio file, it is temporarily held in your browser's memory. This audio data is sent directly to the Google Gemini API for transcription and summarization. We do not store your audio files on our servers.</li>
            <li><strong>Session Data:</strong> All generated transcripts, summaries, and session metadata (like title, date, language) are stored exclusively in your browser's Local Storage. This data persists on your device until you clear your browser's storage or delete the sessions within the app.</li>
            <li><strong>Usage Information:</strong> We do not collect any personal analytics, IP addresses, or tracking information.</li>
        </ul>

        <h3 class="font-bold mt-4 mb-2 text-lg">2. How We Use Information</h3>
        <p>Your data is used solely to provide the core functionality of the application:</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li>To send audio data to the Google Gemini API for processing.</li>
            <li>To display the resulting transcripts and summaries to you.</li>
            <li>To save your sessions in your browser's Local Storage for future access.</li>
        </ul>
        <p class="mt-2">By using our service, you acknowledge that your audio data is processed by Google. We encourage you to review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="text-indigo-500 hover:underline">Google's Privacy Policy</a>.</p>

        <h3 class="font-bold mt-4 mb-2 text-lg">3. Data Storage and Security</h3>
        <p>All your session data is stored in your browser's Local Storage. We do not have access to this data. The security of this data depends on the security of your own device and browser. You are responsible for managing your browser's data.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">4. Data Sharing</h3>
        <p>We do not share your data with any third parties, other than sending the audio data to the Google Gemini API for processing as described above.</p>

        <h3 class="font-bold mt-4 mb-2 text-lg">5. Your Rights</h3>
        <p>Since all data is stored on your device, you have full control. You can view, edit, and delete your sessions at any time directly within the application or by clearing your browser's Local Storage.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">6. Changes to This Policy</h3>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
    `
};

const pl = {
    title: "Polityka Prywatności",
    lastUpdated: "Ostatnia aktualizacja: 24 lipca 2024",
    content: `
        <p>Niniejsza Polityka Prywatności opisuje, w jaki sposób meetsnap ("my", "nas", "nasz") postępuje z Twoimi informacjami podczas korzystania z naszej aplikacji.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">1. Przetwarzane Informacje</h3>
        <p>Meetsnap został zaprojektowany do działania w całości po stronie klienta, co oznacza, że Twoje dane są przetwarzane i przechowywane lokalnie w Twojej przeglądarce.</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li><strong>Dane Audio:</strong> Kiedy nagrywasz lub przesyłasz plik audio, jest on tymczasowo przechowywany w pamięci Twojej przeglądarki. Te dane audio są wysyłane bezpośrednio do API Google Gemini w celu transkrypcji i podsumowania. Nie przechowujemy Twoich plików audio na naszych serwerach.</li>
            <li><strong>Dane Sesji:</strong> Wszystkie wygenerowane transkrypcje, podsumowania i metadane sesji (takie jak tytuł, data, język) są przechowywane wyłącznie w Pamięci Lokalnej (Local Storage) Twojej przeglądarki. Dane te pozostają na Twoim urządzeniu, dopóki nie wyczyścisz pamięci przeglądarki lub nie usuniesz sesji w aplikacji.</li>
            <li><strong>Informacje o Użytkowaniu:</strong> Nie zbieramy żadnych osobistych danych analitycznych, adresów IP ani informacji śledzących.</li>
        </ul>

        <h3 class="font-bold mt-4 mb-2 text-lg">2. Jak Wykorzystujemy Informacje</h3>
        <p>Twoje dane są wykorzystywane wyłącznie do zapewnienia podstawowej funkcjonalności aplikacji:</p>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li>Do wysyłania danych audio do API Google Gemini w celu ich przetworzenia.</li>
            <li>Do wyświetlania Tobie wynikowych transkrypcji i podsumowań.</li>
            <li>Do zapisywania Twoich sesji w Pamięci Lokalnej przeglądarki w celu przyszłego dostępu.</li>
        </ul>
        <p class="mt-2">Korzystając z naszej usługi, potwierdzasz, że Twoje dane audio są przetwarzane przez Google. Zachęcamy do zapoznania się z <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="text-indigo-500 hover:underline">Polityką Prywatności Google</a>.</p>

        <h3 class="font-bold mt-4 mb-2 text-lg">3. Przechowywanie i Bezpieczeństwo Danych</h3>
        <p>Wszystkie dane Twoich sesji są przechowywane w Pamięci Lokalnej Twojej przeglądarki. Nie mamy dostępu do tych danych. Bezpieczeństwo tych danych zależy od bezpieczeństwa Twojego urządzenia i przeglądarki. Jesteś odpowiedzialny za zarządzanie danymi swojej przeglądarki.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">4. Udostępnianie Danych</h3>
        <p>Nie udostępniamy Twoich danych żadnym stronom trzecim, z wyjątkiem wysyłania danych audio do API Google Gemini w celu ich przetworzenia, jak opisano powyżej.</p>

        <h3 class="font-bold mt-4 mb-2 text-lg">5. Twoje Prawa</h3>
        <p>Ponieważ wszystkie dane są przechowywane na Twoim urządzeniu, masz nad nimi pełną kontrolę. Możesz przeglądać, edytować i usuwać swoje sesje w dowolnym momencie bezpośrednio w aplikacji lub czyszcząc Pamięć Lokalną swojej przeglądarki.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">6. Zmiany w Polityce</h3>
        <p>Możemy od czasu do czasu aktualizować niniejszą Politykę Prywatności. O wszelkich zmianach poinformujemy Cię, publikując nową Politykę Prywatności na tej stronie.</p>
    `
};

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ setView }) => {
    const { lang } = useSettings();
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
            <div className="prose dark:prose-invert max-w-none prose-p:text-gray-600 dark:prose-p:text-zinc-300 prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                <p className="text-sm text-gray-500 dark:text-zinc-400">{t.lastUpdated}</p>
                <div dangerouslySetInnerHTML={{ __html: t.content }} />
            </div>
        </div>
    );
};