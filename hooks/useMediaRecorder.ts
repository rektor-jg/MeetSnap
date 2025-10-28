import { useState, useRef, useEffect, useCallback } from 'react';
import type { RecordingError } from '../types';

type Status = 'idle' | 'recording' | 'paused' | 'stopped';

interface UseMediaRecorderProps {
  onStop: (blob: Blob) => void;
}

export const useMediaRecorder = ({ onStop }: UseMediaRecorderProps) => {
  const [status, setStatus] = useState<Status>('idle');
  const [time, setTime] = useState(0);
  const [error, setError] = useState<RecordingError | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamsRef = useRef<MediaStream[]>([]);

  const startTimer = useCallback(() => {
    timerIntervalRef.current = window.setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);
  
  const cleanup = useCallback(() => {
    streamsRef.current.forEach(stream => stream.getTracks().forEach(track => track.stop()));
    streamsRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  const handleRecordingError = useCallback((err: unknown) => {
    console.error("Recording Error:", err);
    if (err instanceof DOMException) {
      if (err.name === 'NotAllowedError') {
        setError({ type: 'PERMISSION_DENIED' });
      } else if (err.name === 'NotSupportedError') {
        setError({ type: 'NOT_SUPPORTED' });
      } else {
        setError({ type: 'UNKNOWN' });
      }
    } else if (err instanceof Error && err.message === 'NO_AUDIO_TRACK') {
      setError({ type: 'NO_AUDIO_TRACK' });
    } else {
      setError({ type: 'UNKNOWN' });
    }
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    setError(null);
    cleanup(); // Clean up any previous state
    let displayStream: MediaStream | null = null;
    
    try {
      // Attempt 1: Audio only (preferred, more efficient)
      displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'NotSupportedError' || err.name === 'TypeError')) {
        console.warn('Audio-only display capture not supported. Falling back to video+audio.');
        try {
          // Attempt 2: Fallback to audio + video (broader compatibility)
          displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
        } catch (fallbackErr) {
          handleRecordingError(fallbackErr);
          cleanup();
          return;
        }
      } else {
        handleRecordingError(err);
        cleanup();
        return;
      }
    }

    try {
      if (!displayStream) throw new Error("Stream capture failed.");

      // Critical check: Ensure the user shared audio.
      if (displayStream.getAudioTracks().length === 0) {
        displayStream.getTracks().forEach(track => track.stop()); // Stop useless stream
        throw new Error('NO_AUDIO_TRACK');
      }
      
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      streamsRef.current = [displayStream, userStream];

      // Stop the video track immediately as we don't need it.
      displayStream.getVideoTracks().forEach(track => track.stop());
      
      const context = new AudioContext();
      audioContextRef.current = context;
      
      const source1 = context.createMediaStreamSource(displayStream);
      const source2 = context.createMediaStreamSource(userStream);
      const destination = context.createMediaStreamDestination();
      
      source1.connect(destination);
      source2.connect(destination);
      
      const combinedStream = destination.stream;
      
      // Add microphone track to combined stream so it has tracks
      userStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      setStatus('recording');
      const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onStop(blob);
        setStatus('stopped');
        cleanup();
      };
      
      mediaRecorder.start();
      setTime(0);
      startTimer();

    } catch (err) {
      handleRecordingError(err);
      cleanup();
    }
  }, [onStop, startTimer, cleanup, handleRecordingError]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      // onstop handler will call cleanup
      stopTimer();
    }
  }, [stopTimer]);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.pause();
      setStatus('paused');
      stopTimer();
    }
  }, [status, stopTimer]);
  
  const resume = useCallback(() => {
    if (mediaRecorderRef.current && status === 'paused') {
      mediaRecorderRef.current.resume();
      setStatus('recording');
      startTimer();
    }
  }, [status, startTimer]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopTimer();
      cleanup();
    };
  }, [stopTimer, cleanup]);

  return { status, time, start, stop, pause, resume, error };
};