import type { Session, Segment, Language } from '../types';
import { formatTimestamp } from './formatUtils';
import { STRINGS } from './i18n';

const triggerDownload = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// toSRT
export const toSRT = (segments: Segment[]): string => {
  return segments
    .map((segment, index) => {
      const start = formatTimestamp(segment.start, 'srt');
      const end = formatTimestamp(segment.end, 'srt');
      return `${index + 1}\n${start} --> ${end}\n${segment.text}\n`;
    })
    .join('\n');
};

// toVTT
export const toVTT = (segments: Segment[]): string => {
  let content = 'WEBVTT\n\n';
  content += segments
    .map((segment) => {
      const start = formatTimestamp(segment.start, 'vtt');
      const end = formatTimestamp(segment.end, 'vtt');
      return `${start} --> ${end}\n${segment.text}\n`;
    })
    .join('\n');
  return content;
};

// toMarkdown
export const toMarkdown = (session: Session, lang: Language): string => {
    let content = `# ${session.title || `Session from ${new Date(session.createdAt).toLocaleString()}`}\n\n`;

    if (session.artifacts?.summaryMd) {
        content += `## ${STRINGS[lang].exportSummary}\n\n`;
        content += `${session.artifacts.summaryMd}\n\n`;
    }

    if (session.artifacts?.rawTranscript) {
        content += `## ${STRINGS[lang].exportTranscription}\n\n`;
        content += session.artifacts.rawTranscript;
    }
    
    return content;
};

// toTXT
export const toTXT = (rawTranscript?: string): string => {
  return rawTranscript || '';
};

// Export Handlers
export const exportToSRT = (session: Session) => {
  if (!session.artifacts?.segments) return;
  const content = toSRT(session.artifacts.segments);
  triggerDownload(content, `${session.id}.srt`, 'text/plain');
};

export const exportToVTT = (session: Session) => {
  if (!session.artifacts?.segments) return;
  const content = toVTT(session.artifacts.segments);
  triggerDownload(content, `${session.id}.vtt`, 'text/vtt');
};

export const exportToMarkdown = (session: Session, lang: Language) => {
  const content = toMarkdown(session, lang);
  triggerDownload(content, `${session.id}.md`, 'text/markdown');
};

export const exportToTXT = (session: Session) => {
  const content = toTXT(session.artifacts?.rawTranscript);
  triggerDownload(content, `${session.id}.txt`, 'text/plain');
};