import { GoogleGenAI, Type } from "@google/genai";
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


/**
 * Approximates transcript segments based on word count.
 * Note: This is a simplified approach as the current API call does not provide word-level timestamps.
 * The duration is estimated based on an average reading speed.
 */
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
    throw new Error("API key is missing. The application cannot connect to the AI service. Ensure the API key is configured correctly.");
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
    ? `Second, based on the transcript, create a concise summary (3-4 sentences). Third, provide a short, descriptive title for the meeting (3-5 words).`
    : ``;

  const prompt = `First, transcribe the provided audio recording accurately, identifying and labeling different speakers (e.g., Speaker 1, Speaker 2). The language of the audio is ${session.language === 'pl' ? 'Polish' : 'English'}.
${summaryInstruction}`;
  
  const selectedModel = MODEL_MAP[session.aiModel] || 'gemini-2.5-flash';

  const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts: [{text: prompt}, audioPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                rawTranscript: {
                    type: Type.STRING,
                    description: 'The full, speaker-diarized transcript of the audio.'
                },
                ...(session.doSummary && {
                    summaryMd: {
                        type: Type.STRING,
                        description: 'A concise 3-4 sentence summary of the transcript in Markdown format.'
                    },
                    title: {
                        type: Type.STRING,
                        description: 'A short, descriptive title for the meeting, about 3-5 words long.'
                    }
                })
            },
            required: session.doSummary ? ['rawTranscript', 'summaryMd', 'title'] : ['rawTranscript']
        }
      }
  });

  try {
    const result = JSON.parse(response.text);
    const rawTranscript = result.rawTranscript || '';
    // Estimate duration based on word count (approx. 2.5 words per second)
    const durationSec = Math.max(30, Math.floor(rawTranscript.split(/\s+/).length / 2.5));
    const segments = createSegments(rawTranscript, durationSec);

    if (session.doSummary) {
        const { title, summaryMd } = result;
        onUpdate({
            status: 'DONE',
            title: title || 'Untitled Session',
            durationSec,
            artifacts: {
                rawTranscript,
                summaryMd: summaryMd || '',
                segments
            },
        });
    } else {
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
  } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e);
      console.error("Raw response text that failed to parse:", response.text);
      onUpdate({
          status: 'ERROR',
          error: 'Failed to parse the response from the AI. The format was unexpected. See console for details.'
      });
  }
};