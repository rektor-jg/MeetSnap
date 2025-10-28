import { GoogleGenAI } from "@google/genai";
import type { Session, Segment, AiModel } from '../types';

// Helper to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // The result includes the Base64 prefix, remove it.
      const base64String = reader.result as string;
      const parts = base64String.split(',');
      if (parts.length > 1) {
        resolve(parts[1]);
      } else {
        reject(new Error("Invalid Base64 string format"));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
};

const MODEL_MAP: Record<AiModel, string> = {
    fast: 'gemini-2.5-flash',
    advanced: 'gemini-2.5-pro',
    premium: 'gemini-2.5-pro',
};

const parseApiResponse = (responseText: string): { title: string, summaryMd: string; rawTranscript: string } => {
    const sections: { title: string[], summary: string[], raw: string[] } = {
        title: [],
        summary: [],
        raw: []
    };
    let currentSection: 'title' | 'summary' | 'raw' | null = null;

    const lines = responseText.split('\n');

    for (const line of lines) {
        if (line.startsWith('TITLE:')) {
            currentSection = 'title';
            sections.title.push(line.substring(6).trim());
        } else if (line.startsWith('SUMMARY:')) {
            currentSection = 'summary';
            const restOfLine = line.substring(8).trim();
            if (restOfLine) sections.summary.push(restOfLine);
        } else if (line.startsWith('RAW TRANSCRIPT:')) {
            currentSection = 'raw';
            const restOfLine = line.substring(15).trim();
            if (restOfLine) sections.raw.push(restOfLine);
        } else if (currentSection) {
            sections[currentSection].push(line);
        }
    }

    return {
        title: sections.title.join(' ').trim() || 'Untitled Session',
        summaryMd: sections.summary.join('\n').trim(),
        rawTranscript: sections.raw.join('\n').trim(),
    };
};

function createSegments(text: string, duration: number): Segment[] {
    const words = text.split(/\s+/).filter(Boolean);
    const numWords = words.length;
    if (numWords === 0) return [];

    const wordsPerSegment = 15; // Average words per segment
    const numSegments = Math.ceil(numWords / wordsPerSegment);
    const timePerSegment = duration / numSegments;
    
    const segments: Segment[] = [];
    if(numSegments <= 0) return [];

    for (let i = 0; i < numSegments; i++) {
        const start = i * timePerSegment;
        const end = Math.min((i + 1) * timePerSegment, duration);
        const textSlice = words.slice(i * wordsPerSegment, (i + 1) * wordsPerSegment).join(' ');
        
        if (textSlice) {
            segments.push({
                start: parseFloat(start.toFixed(2)),
                end: parseFloat(end.toFixed(2)),
                text: textSlice,
            });
        }
    }
    return segments;
}


export const processAudioFile = async (
  session: Session,
  onUpdate: (updates: Partial<Session>) => void
): Promise<void> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Brak klucza API. Aplikacja nie może połączyć się z usługą AI. Upewnij się, że klucz API jest poprawnie skonfigurowany.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  if (!session.audioBlob) {
    throw new Error("Audio blob is missing.");
  }
  
  onUpdate({ status: 'PROCESSING' });

  // Convert audio blob to base64
  const audioBase64 = await blobToBase64(session.audioBlob);
  const audioMimeType = session.audioBlob.type.startsWith('audio/') ? session.audioBlob.type : 'audio/webm';
  
  const audioPart = {
    inlineData: {
        mimeType: audioMimeType,
        data: audioBase64
    },
  };
  
  const summaryInstruction = session.doSummary
    ? `Second, based on the transcript, create a concise summary (3-4 sentences).
Third, provide a short, descriptive title for the meeting (3-5 words).

Format the output strictly as follows, with each section on a new line and no extra formatting:
TITLE: [Your Title Here]
SUMMARY: [Your Summary Here]
RAW TRANSCRIPT: [Full speaker-diarized transcript here]`
    : `RAW TRANSCRIPT: [Full speaker-diarized transcript here]`;

  const prompt = `First, transcribe the provided audio recording accurately, identifying and labeling different speakers (e.g., Speaker 1, Speaker 2). The language of the audio is ${session.language === 'pl' ? 'Polish' : 'English'}.
${summaryInstruction}`;
  
  const selectedModel = MODEL_MAP[session.aiModel] || 'gemini-2.5-flash';

  const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts: [{text: prompt}, audioPart] },
  });

  const responseText = response.text.trim();
  
  if (session.doSummary) {
      const { title, summaryMd, rawTranscript } = parseApiResponse(responseText);
      const durationSec = Math.max(30, Math.floor(rawTranscript.split(/\s+/).length / 2.5)); // Estimate duration
      const segments = createSegments(rawTranscript, durationSec);

      onUpdate({
        status: 'DONE',
        title,
        durationSec,
        artifacts: {
            rawTranscript,
            summaryMd,
            segments
        },
      });
  } else {
      const rawTranscript = responseText.replace(/^RAW TRANSCRIPT:\s*/, '');
      const durationSec = Math.max(30, Math.floor(rawTranscript.split(/\s+/).length / 2.5));
      const segments = createSegments(rawTranscript, durationSec);
      const title = rawTranscript.substring(0, 60).split(' ').slice(0, -1).join(' ') + '...';

      onUpdate({
          status: 'DONE',
          title,
          durationSec,
          artifacts: {
              rawTranscript,
              segments,
              summaryMd: '',
          },
      });
  }
};