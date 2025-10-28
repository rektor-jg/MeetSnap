export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
};

export const formatTimestamp = (seconds: number, format: 'srt' | 'vtt' | 'display' = 'display'): string => {
  const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000).toString().padStart(3, '0');

  if (format === 'display') {
      return `${mm}:${ss}`;
  }
  
  const separator = format === 'srt' ? ',' : '.';
  return `${hh}:${mm}:${ss}${separator}${ms}`;
};
