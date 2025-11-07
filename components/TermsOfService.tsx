import React from 'react';
import type { AppView } from '../types';
import { ChevronLeftIcon } from './icons';
import { useSettings } from '../context/SettingsContext';
import { STRINGS } from '../utils/i18n';

interface TermsOfServiceProps {
    setView: (view: AppView) => void;
}

const en = {
    title: "Terms of Service",
    lastUpdated: "Last Updated: July 24, 2024",
    content: `
        <p>Welcome to meetsnap. By using our application, you agree to these terms. Please read them carefully.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">1. Use of Service</h3>
        <p>Meetsnap provides an audio transcription and summarization service using the Google Gemini API. You agree to use our service responsibly and in compliance with all applicable laws.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">2. User Responsibilities</h3>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li>You are solely responsible for the content of the audio you record or upload.</li>
            <li>You agree not to process any audio that is illegal, harmful, confidential, or infringes on the rights of others (including privacy and intellectual property rights).</li>
            <li>You understand that all processing and storage occurs on your own device and you are responsible for securing it.</li>
        </ul>

        <h3 class="font-bold mt-4 mb-2 text-lg">3. Disclaimer of Warranty</h3>
        <p>The service is provided "as is" without any warranties of any kind. We do not guarantee the accuracy, reliability, or completeness of any transcripts or summaries. The quality of the output depends heavily on the quality of the input audio and the capabilities of the underlying AI model.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">4. Limitation of Liability</h3>
        <p>In no event shall meetsnap be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangibles, arising out of or relating to your use of the service.</p>

        <h3 class="font-bold mt-4 mb-2 text-lg">5. Third-Party Services</h3>
        <p>The service relies on the Google Gemini API. Your use of our service is also subject to Google's terms and policies. We are not responsible for the performance, availability, or policies of third-party services.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">6. Changes to Terms</h3>
        <p>We may modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page. Your continued use of the service after such changes constitutes your acceptance of the new terms.</p>
    `
};

const pl = {
    title: "Regulamin",
    lastUpdated: "Ostatnia aktualizacja: 24 lipca 2024",
    content: `
        <p>Witamy w meetsnap. Korzystając z naszej aplikacji, zgadzasz się na niniejsze warunki. Prosimy o ich uważne przeczytanie.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">1. Korzystanie z Usługi</h3>
        <p>Meetsnap świadczy usługę transkrypcji i podsumowywania audio przy użyciu API Google Gemini. Zgadzasz się korzystać z naszej usługi w sposób odpowiedzialny i zgodny z obowiązującym prawem.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">2. Obowiązki Użytkownika</h3>
        <ul class="list-disc list-inside space-y-2 mt-2">
            <li>Jesteś wyłącznie odpowiedzialny za treść nagrywanego lub przesyłanego przez Ciebie audio.</li>
            <li>Zgadzasz się не przetwarzać żadnych materiałów audio, które są nielegalne, szkodliwe, poufne lub naruszają prawa innych osób (w tym prawa do prywatności i własności intelektualnej).</li>
            <li>Rozumiesz, że całe przetwarzanie i przechowywanie odbywa się na Twoim własnym urządzeniu i jesteś odpowiedzialny za jego zabezpieczenie.</li>
        </ul>

        <h3 class="font-bold mt-4 mb-2 text-lg">3. Wyłączenie Gwarancji</h3>
        <p>Usługa jest świadczona "tak jak jest", bez jakichkolwiek gwarancji. Nie gwarantujemy dokładności, rzetelności ani kompletności transkrypcji lub podsumowań. Jakość wyników w dużej mierze zależy od jakości wejściowego audio oraz możliwości bazowego modelu AI.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">4. Ograniczenie Odpowiedzialności</h3>
        <p>W żadnym wypadku meetsnap nie ponosi odpowiedzialności za jakiekolwiek szkody pośrednie, przypadkowe, specjalne, wynikowe lub karne, w tym utratę zysków, danych lub innych wartości niematerialnych, wynikające z korzystania z usługi lub w związku z nim.</p>

        <h3 class="font-bold mt-4 mb-2 text-lg">5. Usługi Stron Trzecich</h3>
        <p>Usługa opiera się na API Google Gemini. Twoje korzystanie z naszej usługi podlega również warunkom i politykom Google. Nie ponosimy odpowiedzialności za działanie, dostępność ani polityki usług stron trzecich.</p>
        
        <h3 class="font-bold mt-4 mb-2 text-lg">6. Zmiany w Regulaminie</h3>
        <p>Możemy modyfikować niniejsze warunki w dowolnym momencie. O wszelkich zmianach poinformujemy Cię, publikując nowy Regulamin na tej stronie. Dalsze korzystanie z usługi po takich zmianach stanowi akceptację nowych warunków.</p>
    `
};

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ setView }) => {
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
            <div className="prose dark:prose-invert max-w-none prose-p:text-gray-600 dark:prose-p:text-zinc-300 prose-headings:text-gray-900 dark:prose-headings:text-white">
                <p className="text-sm text-gray-500 dark:text-zinc-400">{t.lastUpdated}</p>
                <div dangerouslySetInnerHTML={{ __html: t.content }} />
            </div>
        </div>
    );
};