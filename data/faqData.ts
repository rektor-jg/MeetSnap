import type { Language, AppView } from '../types';

export type FaqContent = string | { type: 'link'; text: string; view: AppView };

interface FaqItem {
  q: string;
  a: FaqContent[];
}

export const FAQ_DATA: Record<Exclude<Language, 'auto'>, FaqItem[]> = {
  en: [
    {
      q: 'How is my privacy protected?',
      a: [
        "Your privacy is our top priority. The application is designed to be client-side, meaning all your data (audio, transcripts, summaries) is stored directly in your browser's Local Storage on your own device. We do not have servers, and we never see or store your data. The only external communication is sending your audio directly to the Google Gemini API for processing. For more details, please see our ",
        { type: 'link', text: 'Privacy Policy', view: { type: 'privacy' } },
        "."
      ],
    },
    {
      q: 'Why does the app need microphone and screen recording permissions?',
      a: [
        "To record audio directly from a browser tab (like a Google Meet call), we need to use the screen recording (`getDisplayMedia`) API. This is a browser security requirement. Although it asks for 'screen recording' permission, we only capture the audio stream from the selected tab and immediately discard the video track. The microphone permission is optional and only needed if you want to include your own voice in the recording."
      ],
    },
    {
        q: 'How accurate are the transcripts and summaries?',
        a: [
            "The accuracy is very high, as we use Google's powerful Gemini AI models. However, the final quality can depend on factors like the clarity of the original audio, background noise, and accents. For best results, ensure the audio source is as clear as possible."
        ],
    },
    {
      q: 'Which audio formats are supported for upload?',
      a: [
        'You can upload files in .wav, .mp3, and .m4a formats. The maximum file size is currently 200MB.'
      ],
    },
    {
        q: 'Is this service free? How do you make money?',
        a: [
            "Currently, the application operates in a demo mode and relies on the user providing their own Google AI API key for processing. In the future, we may introduce subscription plans for users who prefer not to use their own keys or require additional features. This approach allows us to keep the core service accessible while planning for sustainable development."
        ]
    }
  ],
  pl: [
    {
      q: 'Jak chroniona jest moja prywatność?',
      a: [
        "Twoja prywatność jest naszym najwyższym priorytetem. Aplikacja została zaprojektowana tak, aby działać po stronie klienta, co oznacza, że wszystkie Twoje dane (audio, transkrypcje, podsumowania) są przechowywane bezpośrednio w Pamięci Lokalnej (Local Storage) Twojej przeglądarki, na Twoim urządzeniu. Nie posiadamy serwerów i nigdy nie widzimy ani nie przechowujemy Twoich danych. Jedyna zewnętrzna komunikacja to wysłanie Twojego pliku audio bezpośrednio do API Google Gemini w celu przetworzenia. Więcej szczegółów znajdziesz w naszej ",
        { type: 'link', text: 'Polityce Prywatności', view: { type: 'privacy' } },
        "."
      ],
    },
    {
      q: 'Dlaczego aplikacja prosi o uprawnienia do mikrofonu i nagrywania ekranu?',
      a: [
        "Aby nagrywać dźwięk bezpośrednio z karty przeglądarki (np. z rozmowy w Google Meet), musimy użyć API do nagrywania ekranu (`getDisplayMedia`). Jest to wymóg bezpieczeństwa przeglądarek. Mimo że prosi o uprawnienie do 'nagrywania ekranu', przechwytujemy tylko strumień audio z wybranej karty i natychmiast odrzucamy ścieżkę wideo. Uprawnienie do mikrofonu jest opcjonalne i potrzebne tylko wtedy, gdy chcesz, aby Twój głos również został nagrany."
      ],
    },
    {
        q: 'Jak dokładne są transkrypcje i podsumowania?',
        a: [
            "Dokładność jest bardzo wysoka, ponieważ korzystamy z potężnych modeli AI Gemini od Google. Jednak ostateczna jakość może zależeć od takich czynników jak czystość oryginalnego dźwięku, hałas w tle czy akcenty mówców. Aby uzyskać najlepsze rezultaty, upewnij się, że źródło dźwięku jest jak najwyraźniejsze."
        ],
    },
    {
      q: 'Jakie formaty audio są obsługiwane przy przesyłaniu?',
      a: [
        'Możesz przesyłać pliki w formatach .wav, .mp3 oraz .m4a. Obecnie maksymalny rozmiar pliku to 200MB.'
      ],
    },
    {
        q: 'Czy usługa jest darmowa? Jak na tym zarabiacie?',
        a: [
            "Obecnie aplikacja działa w trybie demonstracyjnym i opiera się na kluczu API Google AI dostarczonym przez użytkownika. W przyszłości możemy wprowadzić plany subskrypcyjne dla użytkowników, którzy wolą nie używać własnych kluczy lub potrzebują dodatkowych funkcji. Takie podejście pozwala nam utrzymać podstawową usługę dostępną, jednocześnie planując zrównoważony rozwój."
        ]
    }
  ],
};